export const AXE_WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
] as const;

export interface WcagCriterion {
  title: string;
  level: 'A' | 'AA';
  url: string;
  techniques: string[];
}

export const WCAG_CRITERIA: Record<string, WcagCriterion> = {
  // === Principle 1: Perceivable ===
  // 1.1 Text Alternatives
  '1.1.1': { title: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content', techniques: ['H37', 'H67', 'H36', 'G94', 'G95', 'H2', 'H86'] },
  // 1.2 Time-based Media
  '1.2.1': { title: 'Audio-only and Video-only (Prerecorded)', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded', techniques: ['G158', 'G159', 'G166'] },
  '1.2.2': { title: 'Captions (Prerecorded)', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded', techniques: ['G87', 'G93', 'H95'] },
  '1.2.3': { title: 'Audio Description or Media Alternative (Prerecorded)', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded', techniques: ['G69', 'G58', 'G78'] },
  '1.2.5': { title: 'Audio Description (Prerecorded)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded', techniques: ['G78', 'G173', 'G8'] },
  // 1.3 Adaptable
  '1.3.1': { title: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships', techniques: ['H42', 'H48', 'H51', 'H71', 'H73', 'G115', 'G117', 'G140', 'ARIA11', 'ARIA12'] },
  '1.3.2': { title: 'Meaningful Sequence', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence', techniques: ['G57', 'C6', 'C8', 'C27'] },
  '1.3.3': { title: 'Sensory Characteristics', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics', techniques: ['G96'] },
  '1.3.4': { title: 'Orientation', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/orientation', techniques: ['G214'] },
  '1.3.5': { title: 'Identify Input Purpose', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose', techniques: ['H98'] },
  // 1.4 Distinguishable
  '1.4.1': { title: 'Use of Color', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color', techniques: ['G14', 'G111', 'G182', 'G183'] },
  '1.4.2': { title: 'Audio Control', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control', techniques: ['G60', 'G170', 'G171'] },
  '1.4.3': { title: 'Contrast (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum', techniques: ['G18', 'G145', 'G174'] },
  '1.4.4': { title: 'Resize Text', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text', techniques: ['G142', 'G146', 'C28', 'C12', 'C13', 'C14'] },
  '1.4.5': { title: 'Images of Text', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text', techniques: ['C22', 'C30', 'G140'] },
  '1.4.10': { title: 'Reflow', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow', techniques: ['C31', 'C32', 'C33', 'C38'] },
  '1.4.11': { title: 'Non-text Contrast', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast', techniques: ['G195', 'G207', 'G209'] },
  '1.4.12': { title: 'Text Spacing', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing', techniques: ['C36', 'C35'] },
  '1.4.13': { title: 'Content on Hover or Focus', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus', techniques: ['SCR39'] },
  // === Principle 2: Operable ===
  '2.1.1': { title: 'Keyboard', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard', techniques: ['G202', 'H91', 'SCR2', 'SCR20', 'SCR35'] },
  '2.1.2': { title: 'No Keyboard Trap', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap', techniques: ['G21'] },
  '2.1.4': { title: 'Character Key Shortcuts', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts', techniques: [] },
  '2.4.1': { title: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks', techniques: ['G1', 'G123', 'G124', 'H69', 'ARIA11'] },
  '2.4.2': { title: 'Page Titled', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled', techniques: ['G88', 'H25'] },
  '2.4.3': { title: 'Focus Order', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order', techniques: ['G59', 'H4', 'C27'] },
  '2.4.4': { title: 'Link Purpose (In Context)', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context', techniques: ['G91', 'G189', 'H30', 'H33', 'ARIA7', 'ARIA8'] },
  '2.4.5': { title: 'Multiple Ways', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways', techniques: ['G63', 'G64', 'G125', 'G126', 'G185'] },
  '2.4.6': { title: 'Headings and Labels', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels', techniques: ['G130', 'G131'] },
  '2.4.7': { title: 'Focus Visible', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible', techniques: ['G149', 'G165', 'G195', 'C15', 'C40'] },
  '2.4.11': { title: 'Focus Not Obscured (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum', techniques: ['C43'] },
  '2.5.1': { title: 'Pointer Gestures', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures', techniques: ['G215', 'G216'] },
  '2.5.2': { title: 'Pointer Cancellation', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation', techniques: ['G210', 'G212'] },
  '2.5.3': { title: 'Label in Name', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name', techniques: ['G208', 'G211'] },
  '2.5.4': { title: 'Motion Actuation', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation', techniques: ['G213'] },
  '2.5.7': { title: 'Dragging Movements', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements', techniques: [] },
  '2.5.8': { title: 'Target Size (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum', techniques: [] },
  // === Principle 3: Understandable ===
  '3.1.1': { title: 'Language of Page', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page', techniques: ['H57'] },
  '3.1.2': { title: 'Language of Parts', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts', techniques: ['H58'] },
  '3.2.1': { title: 'On Focus', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus', techniques: ['G107'] },
  '3.2.2': { title: 'On Input', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input', techniques: ['G80', 'G13', 'H32', 'H84', 'SCR19'] },
  '3.2.6': { title: 'Consistent Help', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help', techniques: [] },
  '3.3.1': { title: 'Error Identification', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification', techniques: ['G83', 'G84', 'G85', 'ARIA21'] },
  '3.3.2': { title: 'Labels or Instructions', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions', techniques: ['G131', 'G162', 'G184', 'H44', 'H71', 'ARIA1', 'ARIA9'] },
  '3.3.3': { title: 'Error Suggestion', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion', techniques: ['G83', 'G85', 'G177', 'ARIA2', 'ARIA18'] },
  '3.3.4': { title: 'Error Prevention (Legal, Financial, Data)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data', techniques: ['G98', 'G99', 'G155', 'G164', 'G168'] },
  '3.3.7': { title: 'Redundant Entry', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry', techniques: ['G221', 'H100'] },
  '3.3.8': { title: 'Accessible Authentication (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum', techniques: ['G218', 'H100'] },
  // === Principle 4: Robust ===
  '4.1.2': { title: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value', techniques: ['ARIA14', 'ARIA16', 'G108', 'H44', 'H64', 'H65', 'H91'] },
  '4.1.3': { title: 'Status Messages', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages', techniques: ['ARIA19', 'ARIA22', 'ARIA23', 'G199'] },
};

/**
 * Mapping of common axe-core rule IDs to their WCAG 2.2 success criteria.
 * Used as fallback when axe violation tags are not available in stored data.
 */
export const AXE_RULE_TO_WCAG: Record<string, string[]> = {
  // 1.1 Text Alternatives
  'image-alt': ['1.1.1'],
  'input-image-alt': ['1.1.1'],
  'area-alt': ['1.1.1'],
  'object-alt': ['1.1.1'],
  'svg-img-alt': ['1.1.1'],
  'role-img-alt': ['1.1.1'],
  // 1.2 Time-based Media
  'video-caption': ['1.2.2'],
  // 1.3 Adaptable
  'aria-required-parent': ['1.3.1'],
  'aria-required-children': ['1.3.1'],
  'definition-list': ['1.3.1'],
  'dlitem': ['1.3.1'],
  'list': ['1.3.1'],
  'listitem': ['1.3.1'],
  'th-has-data-cells': ['1.3.1'],
  'td-headers-attr': ['1.3.1'],
  'table-fake-caption': ['1.3.1'],
  'p-as-heading': ['1.3.1'],
  'heading-order': ['1.3.1'],
  'empty-heading': ['1.3.1'],
  'empty-table-header': ['1.3.1'],
  'autocomplete-valid': ['1.3.5'],
  // 1.4 Distinguishable
  'link-in-text-block': ['1.4.1'],
  'color-contrast': ['1.4.3'],
  'color-contrast-enhanced': ['1.4.3'],
  'meta-viewport': ['1.4.4'],
  'meta-viewport-large': ['1.4.4'],
  // 2.1 Keyboard
  'scrollable-region-focusable': ['2.1.1'],
  'nested-interactive': ['2.1.1'],
  // 2.4 Navigable
  'bypass': ['2.4.1'],
  'region': ['2.4.1'],
  'document-title': ['2.4.2'],
  'tabindex': ['2.4.3'],
  'link-name': ['2.4.4'],
  'focus-order-semantics': ['2.4.3'],
  // 2.5 Input Modalities
  'label-content-name-mismatch': ['2.5.3'],
  'target-size': ['2.5.8'],
  // 3.1 Readable
  'html-has-lang': ['3.1.1'],
  'html-lang-valid': ['3.1.1'],
  'html-xml-lang-mismatch': ['3.1.1'],
  'valid-lang': ['3.1.2'],
  // 3.3 Input Assistance
  'label': ['3.3.2', '4.1.2'],
  'select-name': ['3.3.2', '4.1.2'],
  'input-button-name': ['4.1.2'],
  // 4.1 Compatible
  'button-name': ['4.1.2'],
  'duplicate-id': ['4.1.2'],
  'duplicate-id-active': ['4.1.2'],
  'duplicate-id-aria': ['4.1.2'],
  'frame-title': ['4.1.2'],
  'frame-title-unique': ['4.1.2'],
  'aria-allowed-attr': ['4.1.2'],
  'aria-allowed-role': ['4.1.2'],
  'aria-hidden-body': ['4.1.2'],
  'aria-hidden-focus': ['4.1.2'],
  'aria-input-field-name': ['4.1.2'],
  'aria-required-attr': ['4.1.2'],
  'aria-roles': ['4.1.2'],
  'aria-toggle-field-name': ['4.1.2'],
  'aria-valid-attr': ['4.1.2'],
  'aria-valid-attr-value': ['4.1.2'],
  'form-field-multiple-labels': ['3.3.2'],
};

export function extractWcagRefs(tags: string[]): string[] {
  const refs: string[] = [];
  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
    if (match) {
      refs.push(`${match[1]}.${match[2]}.${match[3]}`);
    }
  }
  return [...new Set(refs)];
}
