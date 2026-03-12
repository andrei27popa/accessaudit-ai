export const AXE_WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21aa',
  'wcag22aa',
] as const;

export const WCAG_CRITERIA: Record<string, { title: string; level: string; url: string }> = {
  '1.1.1': { title: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content' },
  '1.2.1': { title: 'Audio-only and Video-only', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded' },
  '1.3.1': { title: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships' },
  '1.3.2': { title: 'Meaningful Sequence', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence' },
  '1.3.3': { title: 'Sensory Characteristics', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics' },
  '1.4.1': { title: 'Use of Color', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color' },
  '1.4.2': { title: 'Audio Control', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control' },
  '1.4.3': { title: 'Contrast (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum' },
  '1.4.4': { title: 'Resize Text', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text' },
  '1.4.5': { title: 'Images of Text', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text' },
  '2.1.1': { title: 'Keyboard', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard' },
  '2.1.2': { title: 'No Keyboard Trap', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap' },
  '2.4.1': { title: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks' },
  '2.4.2': { title: 'Page Titled', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled' },
  '2.4.3': { title: 'Focus Order', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order' },
  '2.4.4': { title: 'Link Purpose (In Context)', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context' },
  '2.4.7': { title: 'Focus Visible', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible' },
  '3.1.1': { title: 'Language of Page', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page' },
  '3.1.2': { title: 'Language of Parts', level: 'AA', url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts' },
  '3.2.1': { title: 'On Focus', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus' },
  '3.2.2': { title: 'On Input', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input' },
  '3.3.1': { title: 'Error Identification', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification' },
  '3.3.2': { title: 'Labels or Instructions', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions' },
  '4.1.1': { title: 'Parsing', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/parsing' },
  '4.1.2': { title: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value' },
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
