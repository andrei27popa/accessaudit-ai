import { Worker, Queue } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import type { ConnectionOptions } from 'bullmq';
import {
  calculateScore,
  getComplianceLabel,
  calculatePriorityScore,
  isScreenReaderBlocker,
} from '@accessaudit/shared';
import { extractWcagRefs, AXE_RULE_TO_WCAG } from '@accessaudit/shared';
import type { SeverityLevel } from '@accessaudit/shared';

export const AGGREGATE_QUEUE = 'aggregate';
export const REMEDIATE_QUEUE = 'remediate';

interface AggregateJob {
  scanId: string;
  type: 'FREE' | 'FULL' | 'VERIFY';
}

export function startAggregatorWorker(prisma: PrismaClient, connection: ConnectionOptions) {
  const remediateQueue = new Queue(REMEDIATE_QUEUE, { connection });

  const worker = new Worker<AggregateJob>(
    AGGREGATE_QUEUE,
    async (job) => {
      const { scanId, type } = job.data;
      console.log(`[Aggregator] Processing scan ${scanId}`);

      try {
        // Get all raw findings for this scan
        const findings = await prisma.findingRaw.findMany({
          where: { scanId },
          include: { page: true },
        });

        // Group findings by ruleId
        const groups = new Map<
          string,
          {
            ruleId: string;
            severity: string;
            description: string;
            help: string;
            helpUrl: string;
            tags: string[];
            pages: Set<string>;
            instances: Array<{
              pageId: string;
              selector: string;
              snippet: string;
              evidence: any;
            }>;
          }
        >();

        for (const finding of findings) {
          const key = finding.ruleId;
          const nodes = finding.nodes as any;

          if (!groups.has(key)) {
            groups.set(key, {
              ruleId: finding.ruleId,
              severity: finding.impact,
              description: finding.description,
              help: finding.help,
              helpUrl: finding.helpUrl,
              tags: [],
              pages: new Set(),
              instances: [],
            });
          }

          const group = groups.get(key)!;
          group.pages.add(finding.pageId);

          // Extract tags from first finding to populate WCAG refs
          const violationTags = Array.isArray(nodes.tags) ? nodes.tags : [];
          if (group.tags.length === 0 && violationTags.length > 0) {
            group.tags = violationTags;
          }

          group.instances.push({
            pageId: finding.pageId,
            selector: Array.isArray(nodes.target) ? nodes.target.join(' > ') : String(nodes.target || ''),
            snippet: nodes.html || '',
            evidence: { failureSummary: nodes.failureSummary },
          });
        }

        // Create issue groups and instances
        const issueGroupIds: string[] = [];

        for (const [, group] of groups) {
          const severity = group.severity as SeverityLevel;
          const affectedPagesCount = group.pages.size;
          const occurrences = group.instances.length;
          // Extract WCAG refs from axe tags, falling back to rule-to-WCAG mapping
          let wcagRefs = extractWcagRefs(group.tags);
          if (wcagRefs.length === 0) {
            wcagRefs = AXE_RULE_TO_WCAG[group.ruleId] || [];
          }

          const priorityScore = calculatePriorityScore(
            severity,
            affectedPagesCount,
            isScreenReaderBlocker(group.ruleId),
          );

          const issueGroup = await prisma.issueGroup.create({
            data: {
              scanId,
              ruleId: group.ruleId,
              severity: severity as any,
              title: group.help,
              description: group.description,
              helpUrl: group.helpUrl,
              wcagRefs: wcagRefs,
              occurrences,
              affectedPagesCount,
              priorityScore,
            },
          });

          issueGroupIds.push(issueGroup.id);

          // Create instances
          for (const instance of group.instances) {
            await prisma.issueInstance.create({
              data: {
                issueGroupId: issueGroup.id,
                pageId: instance.pageId,
                selector: instance.selector,
                snippet: instance.snippet,
                evidence: instance.evidence,
              },
            });
          }
        }

        // Calculate overall score
        const issueGroups = await prisma.issueGroup.findMany({
          where: { scanId },
        });

        const issuesForScoring = issueGroups.map((ig) => ({
          severity: ig.severity as SeverityLevel,
          occurrences: ig.occurrences,
          affectedPagesCount: ig.affectedPagesCount,
        }));

        const score = calculateScore(issuesForScoring);
        const complianceLabel = getComplianceLabel(score);

        // Build summary
        const summary = {
          totalIssues: issueGroups.length,
          criticalCount: issueGroups.filter((ig) => ig.severity === 'CRITICAL').length,
          seriousCount: issueGroups.filter((ig) => ig.severity === 'SERIOUS').length,
          moderateCount: issueGroups.filter((ig) => ig.severity === 'MODERATE').length,
          minorCount: issueGroups.filter((ig) => ig.severity === 'MINOR').length,
          topIssues: issueGroups
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 5)
            .map((ig) => ig.title),
        };

        await prisma.scan.update({
          where: { id: scanId },
          data: {
            score,
            complianceLabel,
            summary,
            status: 'REMEDIATING',
          },
        });

        // Queue AI remediation for top issues
        const topIssueIds = issueGroups
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, type === 'FREE' ? 3 : issueGroups.length)
          .map((ig) => ig.id);

        await remediateQueue.add('remediate', {
          scanId,
          issueGroupIds: topIssueIds,
        });

        console.log(`[Aggregator] Completed scan ${scanId}: score=${score}, ${issueGroups.length} issue groups`);
      } catch (error: any) {
        console.error(`[Aggregator] Failed for scan ${scanId}:`, error.message);
        await prisma.scan.update({
          where: { id: scanId },
          data: { status: 'FAILED', errorMessage: error.message, finishedAt: new Date() },
        });
      }
    },
    { connection, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Aggregator] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
