import { SEVERITY_BASE_PENALTY, SEVERITY_WEIGHT, COMPLIANCE_THRESHOLDS, COMPLIANCE_LABELS } from '../constants/severity';
import type { SeverityLevel, ComplianceLabel } from '../types/scan';

export interface IssueForScoring {
  severity: SeverityLevel;
  occurrences: number;
  affectedPagesCount: number;
}

export function calculatePenalty(issue: IssueForScoring): number {
  const basePenalty = SEVERITY_BASE_PENALTY[issue.severity];
  return basePenalty * Math.log(1 + issue.occurrences);
}

export function calculateScore(issues: IssueForScoring[], lighthouseScore?: number | null): number {
  const totalPenalty = issues.reduce((sum, issue) => sum + calculatePenalty(issue), 0);
  const penaltyScore = Math.max(0, 100 - totalPenalty);

  if (lighthouseScore != null && lighthouseScore > 0) {
    return Math.round((0.7 * penaltyScore + 0.3 * lighthouseScore) * 100) / 100;
  }

  return Math.round(penaltyScore * 100) / 100;
}

export function getComplianceLabel(score: number): ComplianceLabel {
  if (score >= COMPLIANCE_THRESHOLDS.COMPLIANT_MIN) {
    return COMPLIANCE_LABELS.COMPLIANT;
  }
  if (score >= COMPLIANCE_THRESHOLDS.AT_RISK_MIN) {
    return COMPLIANCE_LABELS.AT_RISK;
  }
  return COMPLIANCE_LABELS.NON_COMPLIANT;
}

export function calculatePriorityScore(
  severity: SeverityLevel,
  affectedPagesCount: number,
  isScreenReaderBlocker: boolean = false,
): number {
  const severityWeight = SEVERITY_WEIGHT[severity];
  const pagesWeight = Math.log(1 + affectedPagesCount);
  const userImpactBonus = isScreenReaderBlocker ? 2 : 0;

  return severityWeight * pagesWeight + userImpactBonus;
}

const SCREEN_READER_BLOCKER_RULES = new Set([
  'image-alt',
  'button-name',
  'link-name',
  'input-image-alt',
  'area-alt',
  'label',
  'aria-hidden-focus',
  'aria-required-attr',
]);

export function isScreenReaderBlocker(ruleId: string): boolean {
  return SCREEN_READER_BLOCKER_RULES.has(ruleId);
}
