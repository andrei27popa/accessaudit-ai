import { Worker, Queue } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import { chromium } from 'playwright';
import type { ConnectionOptions } from 'bullmq';

export const SCAN_QUEUE = 'scan';
export const AGGREGATE_QUEUE = 'aggregate';

interface ScanJob {
  scanId: string;
  url: string;
  type: 'FREE' | 'FULL' | 'VERIFY';
}

export function startScannerWorker(prisma: PrismaClient, connection: ConnectionOptions) {
  const aggregateQueue = new Queue(AGGREGATE_QUEUE, { connection });

  const worker = new Worker<ScanJob>(
    SCAN_QUEUE,
    async (job) => {
      const { scanId, url, type } = job.data;
      console.log(`[Scanner] Processing scan ${scanId} for ${url}`);

      try {
        // Update scan status
        await prisma.scan.update({
          where: { id: scanId },
          data: { status: 'SCANNING', startedAt: new Date() },
        });

        // Launch browser and scan
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          userAgent: 'AccessAudit/1.0 (Accessibility Scanner)',
        });
        const page = await context.newPage();
        await page.setViewportSize({ width: 1280, height: 720 });

        // Use domcontentloaded + extra wait for resilience on heavy sites
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const statusCode = response?.status() || 200;
        // Wait for the page to settle (dynamic content, lazy loading)
        await page.waitForTimeout(2000);
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {
          // networkidle is best-effort — proceed if it times out
        }

        // Get page info
        const title = await page.title();

        // Create page record
        const pageRecord = await prisma.page.create({
          data: {
            scanId,
            url,
            title,
            statusCode,
          },
        });

        // Inject and run axe-core
        const axeSource = require('axe-core').source;
        await page.evaluate(axeSource);

        const axeResults = await page.evaluate(() => {
          return (window as any).axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'],
            },
          });
        });

        // Save raw findings
        const violations = axeResults.violations || [];
        for (const violation of violations) {
          const impact = violation.impact?.toUpperCase() || 'MINOR';
          const validImpact = ['CRITICAL', 'SERIOUS', 'MODERATE', 'MINOR'].includes(impact)
            ? impact
            : 'MINOR';

          for (const node of violation.nodes) {
            await prisma.findingRaw.create({
              data: {
                scanId,
                pageId: pageRecord.id,
                ruleId: violation.id,
                impact: validImpact as any,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: {
                  html: node.html,
                  target: node.target,
                  failureSummary: node.failureSummary || '',
                  impact: node.impact || violation.impact,
                  tags: violation.tags || [],
                },
              },
            });
          }
        }

        await browser.close();

        // Update pages scanned count
        await prisma.scan.update({
          where: { id: scanId },
          data: { pagesScanned: 1, status: 'AGGREGATING' },
        });

        // Queue aggregation
        await aggregateQueue.add('aggregate', { scanId, type });

        console.log(`[Scanner] Completed scan ${scanId}: ${violations.length} violation types found`);
      } catch (error: any) {
        console.error(`[Scanner] Failed scan ${scanId}:`, error.message);
        await prisma.scan.update({
          where: { id: scanId },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            finishedAt: new Date(),
          },
        });
      }
    },
    {
      connection,
      concurrency: 2,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Scanner] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
