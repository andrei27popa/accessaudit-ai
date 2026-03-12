export type SeverityLevel = 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR';
export type ScanStatusType = 'QUEUED' | 'SCANNING' | 'AGGREGATING' | 'REMEDIATING' | 'DONE' | 'FAILED';
export type ComplianceLabel = 'Likely compliant' | 'At risk' | 'Non-compliant';

export interface ScanResultDto {
  id: string;
  projectId: string;
  type: string;
  status: ScanStatusType;
  url: string;
  startedAt: string | null;
  finishedAt: string | null;
  pagesScanned: number;
  score: number | null;
  lighthouseScore: number | null;
  complianceLabel: string | null;
  summary: ScanSummary | null;
  createdAt: string;
}

export interface ScanSummary {
  totalIssues: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  topIssues: string[];
}

export interface IssueGroupDto {
  id: string;
  ruleId: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  helpUrl: string;
  wcagRefs: string[];
  occurrences: number;
  affectedPagesCount: number;
  priorityScore: number;
  status: string;
  aiFix: AiFixDto | null;
}

export interface IssueInstanceDto {
  id: string;
  pageId: string;
  pageUrl: string;
  selector: string;
  snippet: string;
  evidence: Record<string, unknown> | null;
}

export interface AiFixDto {
  summary: string;
  whoIsAffected: string;
  whyItMatters: string;
  fixSteps: string[];
  codeFixes: CodeFix[];
  testHowToVerify: string[];
  riskLevel: 'low' | 'medium' | 'high';
  references: string[];
}

export interface CodeFix {
  language: string;
  before: string;
  after: string;
  notes?: string;
}

export interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
  impact: string;
}
