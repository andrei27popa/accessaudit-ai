export interface RemediationInput {
  ruleId: string;
  description: string;
  help: string;
  helpUrl: string;
  wcagRefs: string[];
  severity: string;
  domSnippet: string;
  selector: string;
  detectedStack: string | null;
  siteLanguage?: string;
}

export interface RemediationOutput {
  summary: string;
  whoIsAffected: string;
  whyItMatters: string;
  fixSteps: string[];
  codeFixes: {
    language: string;
    before: string;
    after: string;
    notes?: string;
  }[];
  testHowToVerify: string[];
  riskLevel: 'low' | 'medium' | 'high';
  references: string[];
  // Enhanced fields for framework-specific fixes and legal compliance
  frameworkFixes?: Record<string, string>;
  wcagTechniques?: string[];
  legalContext?: string;
}
