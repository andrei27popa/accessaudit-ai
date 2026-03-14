import { Worker } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import type { ConnectionOptions } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import type { RemediationOutput } from '@accessaudit/shared';
import { WCAG_CRITERIA, AXE_RULE_TO_WCAG, WCAG_TO_FRAMEWORKS, COMPLIANCE_FRAMEWORKS } from '@accessaudit/shared';
import { RULE_FIX_MAP } from './fallback-fixes';

export const REMEDIATE_QUEUE = 'remediate';

interface RemediateJob {
  scanId: string;
  issueGroupIds: string[];
}

const SYSTEM_PROMPT = `You are an expert web accessibility consultant specializing in WCAG 2.2 compliance, assistive technology compatibility, and accessibility law (ADA, EAA, EN 301 549, Section 508).

You analyze accessibility violations found by axe-core and provide actionable, framework-aware remediation guidance.

Return a JSON object with this exact structure:
{
  "summary": "1-2 sentence summary of the issue and its impact",
  "whoIsAffected": "Specific user groups impacted (e.g., screen reader users using NVDA/JAWS/VoiceOver, keyboard-only users, users with low vision)",
  "whyItMatters": "Why this matters - include legal risk (ADA/EAA), UX impact, and business case",
  "fixSteps": ["Step 1...", "Step 2...", "Step 3..."],
  "codeFixes": [
    {
      "language": "html",
      "before": "<code before fix>",
      "after": "<code after fix>",
      "notes": "Explanation referencing specific WCAG technique (e.g., Technique H37, G94)"
    }
  ],
  "frameworkFixes": {
    "react": "React-specific fix if applicable (JSX patterns, hooks, etc.)",
    "vue": "Vue-specific fix if applicable",
    "angular": "Angular-specific fix if applicable"
  },
  "wcagTechniques": ["H37", "G94"],
  "legalContext": "Brief note on which regulations this violates (ADA Title III, EAA, EN 301 549 clause 9.x.x)",
  "testHowToVerify": ["Verification step 1...", "Verification step 2..."],
  "riskLevel": "low|medium|high",
  "references": ["WCAG criterion IDs like 1.1.1"]
}

Rules:
- Generate code fixes adapted to the actual DOM snippet provided
- When a tech stack is detected (React, Vue, Angular), provide framework-specific code fixes using proper component patterns
- Reference specific WCAG sufficient techniques (e.g., H37 for alt text, G18 for contrast)
- Mention relevant legal frameworks: ADA Title III for US sites, EAA/EN 301 549 for EU sites
- Do NOT remove functionality or change semantics without justification
- If context is insufficient, provide 2 variant suggestions
- Only propose safe, non-breaking changes
- Keep explanations clear and actionable for developers
- Return ONLY valid JSON, no markdown wrapping`;

export function startRemediationWorker(prisma: PrismaClient, connection: ConnectionOptions) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const anthropic = apiKey && apiKey !== 'your-anthropic-api-key'
    ? new Anthropic({ apiKey })
    : null;

  const worker = new Worker<RemediateJob>(
    REMEDIATE_QUEUE,
    async (job) => {
      const { scanId, issueGroupIds } = job.data;
      console.log(`[Remediation] Processing ${issueGroupIds.length} issues for scan ${scanId}`);

      try {
        for (const issueGroupId of issueGroupIds) {
          const issueGroup = await prisma.issueGroup.findUnique({
            where: { id: issueGroupId },
            include: {
              instances: { take: 3, include: { page: true } },
              scan: { include: { project: true } },
            },
          });

          if (!issueGroup) continue;

          // Build context for AI
          const domSnippets = issueGroup.instances
            .map((i) => i.snippet)
            .filter(Boolean)
            .slice(0, 3)
            .join('\n---\n');

          const selectors = issueGroup.instances
            .map((i) => i.selector)
            .filter(Boolean)
            .slice(0, 3)
            .join(', ');

          const detectedStack = issueGroup.scan.project.detectedStack || 'HTML';

          // Enrich with WCAG criteria details and legal framework context
          const wcagRefs = (issueGroup.wcagRefs as string[]) || AXE_RULE_TO_WCAG[issueGroup.ruleId] || [];
          const wcagDetails = wcagRefs
            .map((ref) => {
              const criterion = WCAG_CRITERIA[ref];
              return criterion ? `${ref} ${criterion.title} (Level ${criterion.level}) - Techniques: ${criterion.techniques.join(', ')}` : ref;
            })
            .join('\n');

          const affectedFrameworks = [...new Set(
            wcagRefs.flatMap((ref) => WCAG_TO_FRAMEWORKS[ref] || []),
          )]
            .map((id) => COMPLIANCE_FRAMEWORKS[id]?.shortName)
            .filter(Boolean)
            .join(', ');

          const userPrompt = `Analyze this accessibility issue and provide a fix:

Rule ID: ${issueGroup.ruleId}
Severity: ${issueGroup.severity}
Description: ${issueGroup.description}
Title: ${issueGroup.title}
Help URL: ${issueGroup.helpUrl}
Occurrences: ${issueGroup.occurrences}
Affected Pages: ${issueGroup.affectedPagesCount}

WCAG Criteria Details:
${wcagDetails || 'Not mapped'}

Legal Frameworks Affected: ${affectedFrameworks || 'All major frameworks (ADA, EAA, Section 508)'}

DOM Snippet(s):
${domSnippets || 'No DOM snippet available'}

CSS Selector(s): ${selectors || 'No selector available'}

Detected Tech Stack: ${detectedStack}

Evidence from first instance:
${JSON.stringify(issueGroup.instances[0]?.evidence || {}, null, 2)}`;

          let aiFix: RemediationOutput;

          if (anthropic) {
            try {
              const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-6-20250514',
                max_tokens: 2500,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: userPrompt }],
              });

              const text = response.content
                .filter((block): block is Anthropic.TextBlock => block.type === 'text')
                .map((block) => block.text)
                .join('');

              aiFix = JSON.parse(text);
            } catch (aiError: any) {
              console.warn(`[Remediation] AI failed for ${issueGroup.ruleId}, using fallback:`, aiError.message);
              aiFix = generateFallbackFix(issueGroup);
            }
          } else {
            // Fallback: generate a fix from templates without AI
            aiFix = generateFallbackFix(issueGroup);
          }

          await prisma.issueGroup.update({
            where: { id: issueGroupId },
            data: { aiFix: aiFix as any },
          });

          console.log(`[Remediation] Fixed issue ${issueGroup.ruleId} (${issueGroup.severity})`);
        }

        // Mark scan as done
        await prisma.scan.update({
          where: { id: scanId },
          data: { status: 'DONE', finishedAt: new Date() },
        });

        console.log(`[Remediation] Completed all fixes for scan ${scanId}`);
      } catch (error: any) {
        console.error(`[Remediation] Failed for scan ${scanId}:`, error.message);
        // Still mark as done even if remediation fails - the scan results are still valid
        await prisma.scan.update({
          where: { id: scanId },
          data: { status: 'DONE', finishedAt: new Date() },
        });
      }
    },
    { connection, concurrency: 3 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Remediation] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

function generateFallbackFix(issueGroup: any): RemediationOutput {
  const specific = RULE_FIX_MAP[issueGroup.ruleId];
  const wcagRefs = (issueGroup.wcagRefs as string[]) || AXE_RULE_TO_WCAG[issueGroup.ruleId] || [];

  // Get legal context from WCAG refs
  const frameworks = [...new Set(
    wcagRefs.flatMap((ref) => WCAG_TO_FRAMEWORKS[ref] || []),
  )]
    .map((id) => COMPLIANCE_FRAMEWORKS[id]?.shortName)
    .filter(Boolean);

  const legalContext = frameworks.length > 0
    ? `This issue affects compliance with: ${frameworks.join(', ')}.`
    : 'This issue affects compliance with major accessibility regulations including ADA and EAA.';

  if (specific) {
    return {
      summary: specific.summary,
      whoIsAffected: specific.whoIsAffected,
      whyItMatters: specific.whyItMatters || `Fixing this issue improves accessibility compliance and user experience. ${legalContext}`,
      fixSteps: specific.fixSteps,
      codeFixes: specific.codeFixes || (issueGroup.instances?.[0]?.snippet
        ? [{
            language: 'html',
            before: issueGroup.instances[0].snippet,
            after: `<!-- Fix the ${issueGroup.ruleId} issue -->\n${issueGroup.instances[0].snippet}`,
            notes: 'Review and apply the appropriate fix based on context.',
          }]
        : []),
      testHowToVerify: [
        'Run the accessibility scanner again to verify the fix',
        'Test with a screen reader (NVDA, VoiceOver, or JAWS)',
        'Verify keyboard navigation works correctly',
      ],
      riskLevel: 'low',
      references: specific.references || wcagRefs,
      wcagTechniques: specific.wcagTechniques,
      legalContext,
    };
  }

  // Generic fallback for unmapped rules
  return {
    summary: `This element has an accessibility issue: ${issueGroup.title}`,
    whoIsAffected: 'Users who rely on assistive technologies including screen readers and keyboard navigation.',
    whyItMatters: `Fixing this issue improves accessibility compliance and ensures all users can interact with your website. ${legalContext}`,
    fixSteps: [
      `Review the element and fix the "${issueGroup.ruleId}" violation`,
      `Refer to the WCAG documentation for detailed guidance: ${issueGroup.helpUrl || 'https://www.w3.org/WAI/WCAG22/quickref/'}`,
      'Test with a screen reader after making changes',
    ],
    codeFixes: issueGroup.instances?.[0]?.snippet
      ? [{
          language: 'html',
          before: issueGroup.instances[0].snippet,
          after: `<!-- Fix the ${issueGroup.ruleId} issue in this element -->\n${issueGroup.instances[0].snippet}`,
          notes: 'Review and apply the appropriate fix based on the context.',
        }]
      : [],
    testHowToVerify: [
      'Run the accessibility scanner again to verify the fix',
      'Test with a screen reader (NVDA, VoiceOver, or JAWS)',
      'Verify keyboard navigation works correctly',
    ],
    riskLevel: 'low',
    references: wcagRefs,
    legalContext,
  };
}
