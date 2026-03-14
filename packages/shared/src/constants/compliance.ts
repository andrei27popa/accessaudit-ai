export interface ComplianceFramework {
  id: string;
  name: string;
  shortName: string;
  region: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  url: string;
}

export const COMPLIANCE_FRAMEWORKS: Record<string, ComplianceFramework> = {
  ADA: {
    id: 'ADA',
    name: 'Americans with Disabilities Act',
    shortName: 'ADA Title III',
    region: 'United States',
    description: 'US federal civil rights law. Courts reference WCAG 2.1 AA as the standard.',
    wcagLevel: 'AA',
    url: 'https://www.ada.gov/resources/web-guidance/',
  },
  SECTION508: {
    id: 'SECTION508',
    name: 'Section 508 of the Rehabilitation Act',
    shortName: 'Section 508',
    region: 'United States',
    description: 'Applies to US federal agencies. Incorporates WCAG 2.0 AA.',
    wcagLevel: 'AA',
    url: 'https://www.section508.gov/',
  },
  EAA: {
    id: 'EAA',
    name: 'European Accessibility Act',
    shortName: 'EAA',
    region: 'European Union',
    description: 'EU directive effective June 2025. References EN 301 549 / WCAG 2.1 AA.',
    wcagLevel: 'AA',
    url: 'https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en',
  },
  EN301549: {
    id: 'EN301549',
    name: 'EN 301 549 - Accessibility requirements for ICT',
    shortName: 'EN 301 549',
    region: 'European Union',
    description: 'European standard for ICT accessibility. Maps to WCAG 2.1 AA.',
    wcagLevel: 'AA',
    url: 'https://www.etsi.org/human-factors-accessibility/en-301-549',
  },
  AODA: {
    id: 'AODA',
    name: 'Accessibility for Ontarians with Disabilities Act',
    shortName: 'AODA',
    region: 'Canada (Ontario)',
    description: 'Ontario regulation requiring WCAG 2.0 AA for web content.',
    wcagLevel: 'AA',
    url: 'https://www.ontario.ca/laws/statute/05a11',
  },
};

// All WCAG 2.0 A+AA apply to all frameworks
const ALL_FRAMEWORKS = ['ADA', 'SECTION508', 'EAA', 'EN301549', 'AODA'];
// WCAG 2.1 additions apply to newer frameworks (not Section508/AODA which reference 2.0)
const WCAG21_FRAMEWORKS = ['ADA', 'EAA', 'EN301549'];
// WCAG 2.2 additions primarily apply to EU frameworks
const WCAG22_FRAMEWORKS = ['EAA', 'EN301549'];

export const WCAG_TO_FRAMEWORKS: Record<string, string[]> = {
  // WCAG 2.0 Level A
  '1.1.1': ALL_FRAMEWORKS,
  '1.2.1': ALL_FRAMEWORKS,
  '1.2.2': ALL_FRAMEWORKS,
  '1.2.3': ALL_FRAMEWORKS,
  '1.3.1': ALL_FRAMEWORKS,
  '1.3.2': ALL_FRAMEWORKS,
  '1.3.3': ALL_FRAMEWORKS,
  '1.4.1': ALL_FRAMEWORKS,
  '1.4.2': ALL_FRAMEWORKS,
  '2.1.1': ALL_FRAMEWORKS,
  '2.1.2': ALL_FRAMEWORKS,
  '2.4.1': ALL_FRAMEWORKS,
  '2.4.2': ALL_FRAMEWORKS,
  '2.4.3': ALL_FRAMEWORKS,
  '2.4.4': ALL_FRAMEWORKS,
  '3.1.1': ALL_FRAMEWORKS,
  '3.2.1': ALL_FRAMEWORKS,
  '3.2.2': ALL_FRAMEWORKS,
  '3.3.1': ALL_FRAMEWORKS,
  '3.3.2': ALL_FRAMEWORKS,
  '4.1.2': ALL_FRAMEWORKS,
  // WCAG 2.0 Level AA
  '1.2.5': ALL_FRAMEWORKS,
  '1.4.3': ALL_FRAMEWORKS,
  '1.4.4': ALL_FRAMEWORKS,
  '1.4.5': ALL_FRAMEWORKS,
  '2.4.5': ALL_FRAMEWORKS,
  '2.4.6': ALL_FRAMEWORKS,
  '2.4.7': ALL_FRAMEWORKS,
  '3.1.2': ALL_FRAMEWORKS,
  '3.3.3': ALL_FRAMEWORKS,
  '3.3.4': ALL_FRAMEWORKS,
  // WCAG 2.1 Level A additions
  '2.1.4': WCAG21_FRAMEWORKS,
  '2.5.1': WCAG21_FRAMEWORKS,
  '2.5.2': WCAG21_FRAMEWORKS,
  '2.5.3': WCAG21_FRAMEWORKS,
  '2.5.4': WCAG21_FRAMEWORKS,
  // WCAG 2.1 Level AA additions
  '1.3.4': WCAG21_FRAMEWORKS,
  '1.3.5': WCAG21_FRAMEWORKS,
  '1.4.10': WCAG21_FRAMEWORKS,
  '1.4.11': WCAG21_FRAMEWORKS,
  '1.4.12': WCAG21_FRAMEWORKS,
  '1.4.13': WCAG21_FRAMEWORKS,
  '4.1.3': WCAG21_FRAMEWORKS,
  // WCAG 2.2 Level A additions
  '3.2.6': WCAG22_FRAMEWORKS,
  '3.3.7': WCAG22_FRAMEWORKS,
  // WCAG 2.2 Level AA additions
  '2.4.11': WCAG22_FRAMEWORKS,
  '2.4.12': WCAG22_FRAMEWORKS,
  '2.4.13': WCAG22_FRAMEWORKS,
  '2.5.7': WCAG22_FRAMEWORKS,
  '2.5.8': WCAG22_FRAMEWORKS,
  '3.3.8': WCAG22_FRAMEWORKS,
};

export function getFrameworksForCriteria(wcagRefs: string[]): string[] {
  const frameworks = new Set<string>();
  for (const ref of wcagRefs) {
    const fws = WCAG_TO_FRAMEWORKS[ref];
    if (fws) fws.forEach((fw) => frameworks.add(fw));
  }
  return [...frameworks];
}

export const COMPLIANCE_REPORT_LABELS = {
  PASS: 'Supports',
  FAIL: 'Does Not Support',
  PARTIAL: 'Partially Supports',
  NOT_APPLICABLE: 'Not Applicable',
  NOT_EVALUATED: 'Not Evaluated',
} as const;
