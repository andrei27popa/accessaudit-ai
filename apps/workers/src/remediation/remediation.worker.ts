import { Worker } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import type { ConnectionOptions } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import type { RemediationOutput } from '@accessaudit/shared';

export const REMEDIATE_QUEUE = 'remediate';

interface RemediateJob {
  scanId: string;
  issueGroupIds: string[];
}

const SYSTEM_PROMPT = `You are an expert web accessibility consultant. You analyze accessibility violations found by automated scanning tools (axe-core) and provide actionable, context-aware remediation guidance.

Your task is to analyze the given accessibility issue and provide a fix recommendation. You must return a JSON object with this exact structure:

{
  "summary": "1-2 sentence summary of the issue",
  "whoIsAffected": "Who is impacted (e.g., screen reader users, keyboard users)",
  "whyItMatters": "Why this matters (legal, UX, business impact)",
  "fixSteps": ["Step 1...", "Step 2...", "Step 3..."],
  "codeFixes": [
    {
      "language": "html",
      "before": "<code before fix>",
      "after": "<code after fix>",
      "notes": "Optional explanation"
    }
  ],
  "testHowToVerify": ["Verification step 1...", "Verification step 2..."],
  "riskLevel": "low|medium|high",
  "references": ["WCAG criterion IDs like 1.1.1"]
}

Rules:
- Generate code fixes adapted to the actual DOM snippet provided
- Do NOT remove functionality
- Do NOT change semantics without justification
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

          const userPrompt = `Analyze this accessibility issue and provide a fix:

Rule ID: ${issueGroup.ruleId}
Severity: ${issueGroup.severity}
Description: ${issueGroup.description}
Title: ${issueGroup.title}
Help URL: ${issueGroup.helpUrl}
WCAG References: ${JSON.stringify(issueGroup.wcagRefs)}
Occurrences: ${issueGroup.occurrences}
Affected Pages: ${issueGroup.affectedPagesCount}

DOM Snippet(s):
${domSnippets || 'No DOM snippet available'}

CSS Selector(s): ${selectors || 'No selector available'}

Detected Tech Stack: ${detectedStack}

Evidence from first instance:
${JSON.stringify(issueGroup.instances[0]?.evidence || {}, null, 2)}`;

          let aiFix: RemediationOutput;

          if (anthropic) {
            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-6-20250514',
              max_tokens: 2000,
              system: SYSTEM_PROMPT,
              messages: [{ role: 'user', content: userPrompt }],
            });

            const text = response.content
              .filter((block): block is Anthropic.TextBlock => block.type === 'text')
              .map((block) => block.text)
              .join('');

            aiFix = JSON.parse(text);
          } else {
            // Fallback: generate a basic fix without AI
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
        // Still mark as done even if AI fails - the scan results are still valid
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
  const ruleFixMap: Record<string, Partial<RemediationOutput>> = {
    'image-alt': {
      summary: 'Images must have alternative text to be accessible to screen reader users.',
      whoIsAffected: 'Screen reader users who cannot see images.',
      fixSteps: [
        'Add a descriptive alt attribute to the <img> element',
        'If the image is decorative, use alt="" (empty alt)',
        'Ensure alt text describes the purpose, not just appearance',
      ],
    },
    'button-name': {
      summary: 'Buttons must have discernible text for assistive technology users.',
      whoIsAffected: 'Screen reader users and voice control users.',
      fixSteps: [
        'Add visible text content to the button',
        'Or add an aria-label attribute with descriptive text',
        'For icon buttons, use aria-label to describe the action',
      ],
    },
    'link-name': {
      summary: 'Links must have discernible text so users know where they navigate.',
      whoIsAffected: 'Screen reader users who rely on link text for navigation.',
      fixSteps: [
        'Add descriptive text inside the <a> element',
        'Or add an aria-label attribute',
        'Avoid generic text like "click here" or "read more"',
      ],
    },
    'color-contrast': {
      summary: 'Text must have sufficient color contrast against its background.',
      whoIsAffected: 'Users with low vision or color vision deficiencies.',
      fixSteps: [
        'Ensure text contrast ratio meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)',
        'Use a contrast checker tool to verify',
        'Adjust either text or background color',
      ],
    },
    label: {
      summary: 'Form inputs must have associated labels for screen reader users.',
      whoIsAffected: 'Screen reader users who need to understand form field purposes.',
      fixSteps: [
        'Add a <label> element with a for attribute matching the input id',
        'Or use aria-label or aria-labelledby',
        'Ensure the label clearly describes the expected input',
      ],
    },
  };

  const specific = ruleFixMap[issueGroup.ruleId] || {};

  return {
    summary: specific.summary || `This element has an accessibility issue: ${issueGroup.title}`,
    whoIsAffected: specific.whoIsAffected || 'Users who rely on assistive technologies.',
    whyItMatters: 'Fixing this issue improves accessibility compliance and ensures all users can interact with your website.',
    fixSteps: specific.fixSteps || [
      `Review the element and fix the "${issueGroup.ruleId}" violation`,
      'Refer to the WCAG documentation for detailed guidance',
      'Test with a screen reader after making changes',
    ],
    codeFixes: issueGroup.instances?.[0]?.snippet
      ? [
          {
            language: 'html',
            before: issueGroup.instances[0].snippet,
            after: `<!-- Fix the ${issueGroup.ruleId} issue in this element -->\n${issueGroup.instances[0].snippet}`,
            notes: 'Review and apply the appropriate fix based on the context.',
          },
        ]
      : [],
    testHowToVerify: [
      'Run the accessibility scanner again to verify the fix',
      'Test with a screen reader (NVDA, VoiceOver, or JAWS)',
      'Verify keyboard navigation works correctly',
    ],
    riskLevel: 'low',
    references: Array.isArray(issueGroup.wcagRefs) ? issueGroup.wcagRefs : [],
  };
}
