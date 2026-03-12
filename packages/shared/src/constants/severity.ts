import type { SeverityLevel } from '../types/scan';

export const SEVERITY_BASE_PENALTY: Record<SeverityLevel, number> = {
  CRITICAL: 10,
  SERIOUS: 6,
  MODERATE: 3,
  MINOR: 1,
};

export const SEVERITY_WEIGHT: Record<SeverityLevel, number> = {
  CRITICAL: 5,
  SERIOUS: 4,
  MODERATE: 2,
  MINOR: 1,
};

export const SEVERITY_ORDER: SeverityLevel[] = ['CRITICAL', 'SERIOUS', 'MODERATE', 'MINOR'];

export const COMPLIANCE_THRESHOLDS = {
  COMPLIANT_MIN: 90,
  AT_RISK_MIN: 70,
} as const;

export const COMPLIANCE_LABELS = {
  COMPLIANT: 'Likely compliant',
  AT_RISK: 'At risk',
  NON_COMPLIANT: 'Non-compliant',
} as const;
