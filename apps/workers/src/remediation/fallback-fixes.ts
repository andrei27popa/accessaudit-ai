import type { RemediationOutput } from '@accessaudit/shared';

type PartialFix = Partial<RemediationOutput> & {
  summary: string;
  whoIsAffected: string;
  fixSteps: string[];
};

export const RULE_FIX_MAP: Record<string, PartialFix> = {
  // === Text Alternatives (WCAG 1.1.1) ===
  'image-alt': {
    summary: 'Images must have alternative text to be accessible to screen reader users.',
    whoIsAffected: 'Screen reader users (NVDA, JAWS, VoiceOver) who cannot see images.',
    whyItMatters: 'Required by WCAG 1.1.1 (Level A). Violations affect ADA Title III, EAA, and Section 508 compliance. Missing alt text means screen reader users receive no information about the image content.',
    fixSteps: [
      'Add a descriptive alt attribute to the <img> element that conveys the image purpose',
      'If the image is purely decorative, use alt="" (empty alt) to hide it from screen readers',
      'Avoid using file names or generic text like "image" as alt text',
    ],
    codeFixes: [
      { language: 'html', before: '<img src="chart.png">', after: '<img src="chart.png" alt="Q3 revenue chart showing 15% growth">', notes: 'WCAG Technique H37: Provide descriptive alt text that conveys the same information as the image.' },
    ],
    wcagTechniques: ['H37', 'H67', 'G94', 'G95'],
    references: ['1.1.1'],
  },

  'input-image-alt': {
    summary: 'Image buttons (<input type="image">) must have alt text describing the button action.',
    whoIsAffected: 'Screen reader and voice control users who need to know the button purpose.',
    fixSteps: [
      'Add an alt attribute to the <input type="image"> describing the action (e.g., "Submit", "Search")',
      'The alt text should describe the action, not the image appearance',
    ],
    codeFixes: [
      { language: 'html', before: '<input type="image" src="submit.png">', after: '<input type="image" src="submit.png" alt="Submit form">', notes: 'WCAG Technique H36: Use alt on image submit buttons.' },
    ],
    wcagTechniques: ['H36'],
    references: ['1.1.1'],
  },

  'area-alt': {
    summary: 'Image map <area> elements must have alt text.',
    whoIsAffected: 'Screen reader users navigating image maps.',
    fixSteps: [
      'Add an alt attribute to each <area> element in the image map',
      'Alt text should describe the destination or action of the clickable area',
    ],
    wcagTechniques: ['H24'],
    references: ['1.1.1'],
  },

  // === Color & Contrast (WCAG 1.4.x) ===
  'color-contrast': {
    summary: 'Text must have sufficient color contrast against its background to be readable.',
    whoIsAffected: 'Users with low vision, color vision deficiencies, and users in bright environments.',
    whyItMatters: 'Required by WCAG 1.4.3 (Level AA). WCAG requires 4.5:1 ratio for normal text and 3:1 for large text (18pt+ or 14pt+ bold). Non-compliance creates legal risk under ADA and EAA.',
    fixSteps: [
      'Check the contrast ratio using a tool like the WebAIM Contrast Checker',
      'Adjust the text color or background color to meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)',
      'Ensure text remains readable across all background colors and states',
    ],
    codeFixes: [
      { language: 'css', before: 'color: #767676;\nbackground: #ffffff;', after: 'color: #595959;\nbackground: #ffffff;', notes: 'WCAG Technique G18: Ensure 4.5:1 contrast ratio. #595959 on white = 7:1 ratio.' },
    ],
    wcagTechniques: ['G18', 'G145', 'G174'],
    references: ['1.4.3'],
  },

  'link-in-text-block': {
    summary: 'Links within text blocks must be distinguishable without relying solely on color.',
    whoIsAffected: 'Users with color vision deficiencies who cannot distinguish links by color alone.',
    fixSteps: [
      'Add an underline or other non-color visual indicator to links',
      'Ensure links have 3:1 contrast ratio with surrounding text if no underline',
      'Consider adding underline on hover/focus at minimum',
    ],
    codeFixes: [
      { language: 'css', before: 'a { color: blue; text-decoration: none; }', after: 'a { color: blue; text-decoration: underline; }', notes: 'WCAG Technique G183: Add underline to make links distinguishable without color.' },
    ],
    wcagTechniques: ['G183'],
    references: ['1.4.1'],
  },

  'meta-viewport': {
    summary: 'The meta viewport tag must not disable user zooming.',
    whoIsAffected: 'Users with low vision who need to zoom in to read content.',
    fixSteps: [
      'Remove maximum-scale=1.0 or user-scalable=no from the meta viewport tag',
      'Allow users to zoom up to at least 200%',
    ],
    codeFixes: [
      { language: 'html', before: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">', after: '<meta name="viewport" content="width=device-width, initial-scale=1">', notes: 'WCAG Technique G142: Allow zooming by removing restrictive viewport settings.' },
    ],
    wcagTechniques: ['G142'],
    references: ['1.4.4'],
  },

  // === Language (WCAG 3.1.x) ===
  'html-has-lang': {
    summary: 'The <html> element must have a lang attribute so assistive technologies can determine the page language.',
    whoIsAffected: 'Screen reader users - without lang, screen readers may use the wrong pronunciation engine, making content incomprehensible.',
    whyItMatters: 'Required by WCAG 3.1.1 (Level A). Affects all compliance frameworks (ADA, EAA, Section 508).',
    fixSteps: [
      'Add a lang attribute to the <html> element with the correct BCP 47 language tag',
      'Use the primary language of the page content (e.g., "en" for English, "fr" for French, "de" for German)',
    ],
    codeFixes: [
      { language: 'html', before: '<html>', after: '<html lang="en">', notes: 'WCAG Technique H57: Set the language of the page using the lang attribute.' },
    ],
    wcagTechniques: ['H57'],
    references: ['3.1.1'],
  },

  'html-lang-valid': {
    summary: 'The lang attribute on <html> must use a valid BCP 47 language tag.',
    whoIsAffected: 'Screen reader users who rely on correct language identification for pronunciation.',
    fixSteps: [
      'Replace the invalid lang value with a valid BCP 47 tag',
      'Common values: "en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "ar"',
    ],
    codeFixes: [
      { language: 'html', before: '<html lang="english">', after: '<html lang="en">', notes: 'Use standard BCP 47 codes, not full language names.' },
    ],
    wcagTechniques: ['H57'],
    references: ['3.1.1'],
  },

  'valid-lang': {
    summary: 'The lang attribute on elements must use valid BCP 47 language tags.',
    whoIsAffected: 'Screen reader users encountering content in different languages within the same page.',
    fixSteps: [
      'Use valid BCP 47 language codes on lang attributes',
      'Mark up content in different languages with the appropriate lang attribute',
    ],
    wcagTechniques: ['H58'],
    references: ['3.1.2'],
  },

  // === Document Structure (WCAG 2.4.x) ===
  'document-title': {
    summary: 'The page must have a descriptive <title> element.',
    whoIsAffected: 'Screen reader users, users with multiple tabs open, and search engine users who rely on page titles for orientation.',
    fixSteps: [
      'Add a unique, descriptive <title> element inside <head>',
      'The title should describe the page purpose and content',
      'Include the site name after the page-specific title',
    ],
    codeFixes: [
      { language: 'html', before: '<head>\n  <!-- no title -->\n</head>', after: '<head>\n  <title>Contact Us - Company Name</title>\n</head>', notes: 'WCAG Technique H25: Provide a descriptive page title.' },
    ],
    wcagTechniques: ['H25', 'G88'],
    references: ['2.4.2'],
  },

  'bypass': {
    summary: 'The page should provide a mechanism to skip repetitive navigation blocks.',
    whoIsAffected: 'Keyboard users and screen reader users who must tab through navigation on every page.',
    fixSteps: [
      'Add a "Skip to main content" link as the first focusable element on the page',
      'Ensure the link becomes visible on focus',
      'Link to the main content area using an id reference',
    ],
    codeFixes: [
      { language: 'html', before: '<body>\n  <nav>...</nav>', after: '<body>\n  <a href="#main" class="skip-link">Skip to main content</a>\n  <nav>...</nav>\n  <main id="main">...</main>', notes: 'WCAG Technique G1: Add a skip-to-content link at the top of the page.' },
    ],
    wcagTechniques: ['G1', 'G123', 'G124'],
    references: ['2.4.1'],
  },

  'region': {
    summary: 'All page content should be contained within landmark regions.',
    whoIsAffected: 'Screen reader users who use landmarks to navigate page sections.',
    fixSteps: [
      'Wrap all visible page content in appropriate landmark elements (<header>, <nav>, <main>, <footer>, <aside>)',
      'Ensure there is exactly one <main> landmark',
      'Use role attributes if semantic HTML elements cannot be used',
    ],
    codeFixes: [
      { language: 'html', before: '<div class="content">...</div>', after: '<main class="content">...</main>', notes: 'WCAG Technique ARIA11: Use semantic HTML5 landmark elements.' },
    ],
    wcagTechniques: ['ARIA11'],
    references: ['2.4.1'],
  },

  'heading-order': {
    summary: 'Heading levels should increase by one without skipping levels.',
    whoIsAffected: 'Screen reader users who navigate by headings to understand page structure.',
    fixSteps: [
      'Ensure headings follow a logical order (h1 > h2 > h3) without skipping levels',
      'Each page should have exactly one h1',
      'Do not use heading elements just for visual styling - use CSS instead',
    ],
    codeFixes: [
      { language: 'html', before: '<h1>Title</h1>\n<h3>Section</h3>', after: '<h1>Title</h1>\n<h2>Section</h2>', notes: 'WCAG Technique G141: Organize page content using heading hierarchy.' },
    ],
    wcagTechniques: ['G141', 'H42'],
    references: ['1.3.1'],
  },

  'empty-heading': {
    summary: 'Headings must not be empty - they must contain visible text.',
    whoIsAffected: 'Screen reader users who encounter empty headings while navigating, causing confusion.',
    fixSteps: [
      'Add text content to the heading element',
      'If the heading is only for visual spacing, remove the heading tag and use CSS margin/padding instead',
    ],
    codeFixes: [
      { language: 'html', before: '<h2></h2>', after: '<h2>Section Title</h2>', notes: 'Every heading element must contain discernible text content.' },
    ],
    references: ['1.3.1', '2.4.6'],
  },

  'tabindex': {
    summary: 'Elements should not have a tabindex value greater than 0.',
    whoIsAffected: 'Keyboard users - positive tabindex values disrupt the natural tab order and cause confusion.',
    fixSteps: [
      'Remove or change tabindex values greater than 0 to tabindex="0" or remove entirely',
      'Use DOM order to control tab sequence instead of tabindex values',
      'tabindex="-1" is acceptable for programmatic focus management',
    ],
    codeFixes: [
      { language: 'html', before: '<button tabindex="5">Submit</button>', after: '<button>Submit</button>', notes: 'WCAG Technique H4: Use DOM source order to create logical tab sequence.' },
    ],
    wcagTechniques: ['H4'],
    references: ['2.4.3'],
  },

  // === Interactive Elements (WCAG 4.1.2) ===
  'button-name': {
    summary: 'Buttons must have discernible text for assistive technology users.',
    whoIsAffected: 'Screen reader users and voice control users who need to identify and activate buttons.',
    whyItMatters: 'Required by WCAG 4.1.2 (Level A). Buttons without accessible names are invisible to screen readers.',
    fixSteps: [
      'Add visible text content to the button',
      'For icon-only buttons, add an aria-label describing the action',
      'Ensure the accessible name matches the visible label for voice control users',
    ],
    codeFixes: [
      { language: 'html', before: '<button><svg>...</svg></button>', after: '<button aria-label="Close dialog"><svg>...</svg></button>', notes: 'WCAG Technique ARIA14: Use aria-label for icon-only buttons.' },
    ],
    wcagTechniques: ['ARIA14', 'G108'],
    references: ['4.1.2'],
  },

  'link-name': {
    summary: 'Links must have discernible text so users know where they navigate.',
    whoIsAffected: 'Screen reader users who rely on link text for navigation, and voice control users who activate links by name.',
    fixSteps: [
      'Add descriptive text inside the <a> element',
      'For image links, add alt text to the image',
      'Avoid generic text like "click here" or "read more" - use descriptive link text',
    ],
    codeFixes: [
      { language: 'html', before: '<a href="/report"><img src="pdf.png"></a>', after: '<a href="/report"><img src="pdf.png" alt="Download annual report (PDF)"></a>', notes: 'WCAG Technique H30: Provide link text via image alt or element content.' },
    ],
    wcagTechniques: ['H30', 'G91', 'ARIA7'],
    references: ['2.4.4'],
  },

  'label': {
    summary: 'Form inputs must have associated labels for screen reader users.',
    whoIsAffected: 'Screen reader users who need to understand form field purposes, and voice control users who activate fields by label.',
    whyItMatters: 'Required by WCAG 3.3.2 and 4.1.2. Unlabeled fields make forms unusable for assistive technology users.',
    fixSteps: [
      'Add a <label> element with a for attribute matching the input id',
      'Or wrap the input inside a <label> element',
      'As a last resort, use aria-label or aria-labelledby',
    ],
    codeFixes: [
      { language: 'html', before: '<input type="email" id="email">', after: '<label for="email">Email address</label>\n<input type="email" id="email">', notes: 'WCAG Technique H44: Associate labels with form controls using for/id.' },
    ],
    wcagTechniques: ['H44', 'H65', 'ARIA1'],
    references: ['3.3.2', '4.1.2'],
  },

  'select-name': {
    summary: 'Select elements must have an accessible name.',
    whoIsAffected: 'Screen reader users who need to understand the purpose of dropdown selections.',
    fixSteps: [
      'Add a <label> element associated with the select via for/id',
      'Or use aria-label or aria-labelledby',
    ],
    codeFixes: [
      { language: 'html', before: '<select id="country">...</select>', after: '<label for="country">Country</label>\n<select id="country">...</select>', notes: 'WCAG Technique H44: Associate labels with select controls.' },
    ],
    wcagTechniques: ['H44'],
    references: ['3.3.2', '4.1.2'],
  },

  'frame-title': {
    summary: 'Iframes must have a title attribute describing their content.',
    whoIsAffected: 'Screen reader users who need to understand iframe purpose before entering it.',
    fixSteps: [
      'Add a descriptive title attribute to the <iframe> element',
      'The title should describe the embedded content purpose',
    ],
    codeFixes: [
      { language: 'html', before: '<iframe src="https://maps.google.com/embed"></iframe>', after: '<iframe src="https://maps.google.com/embed" title="Google Maps showing office location"></iframe>', notes: 'WCAG Technique H64: Use the title attribute on iframe elements.' },
    ],
    wcagTechniques: ['H64'],
    references: ['4.1.2'],
  },

  // === ARIA (WCAG 4.1.2) ===
  'aria-allowed-attr': {
    summary: 'ARIA attributes must be valid for the element role.',
    whoIsAffected: 'Screen reader users who may receive incorrect information from invalid ARIA attributes.',
    fixSteps: [
      'Check the WAI-ARIA specification for allowed attributes on the element role',
      'Remove ARIA attributes that are not supported by the element role',
      'Consider if native HTML semantics can replace ARIA',
    ],
    wcagTechniques: ['ARIA5'],
    references: ['4.1.2'],
  },

  'aria-required-attr': {
    summary: 'Elements with ARIA roles must have all required ARIA attributes.',
    whoIsAffected: 'Screen reader users who depend on ARIA attributes for widget state information.',
    fixSteps: [
      'Check the WAI-ARIA specification for required attributes on the role',
      'Add missing required ARIA attributes with appropriate values',
      'Consider using native HTML elements that provide the semantics automatically',
    ],
    wcagTechniques: ['ARIA5'],
    references: ['4.1.2'],
  },

  'aria-valid-attr': {
    summary: 'ARIA attributes must be spelled correctly and exist in the specification.',
    whoIsAffected: 'Screen reader users - invalid ARIA attributes are silently ignored, losing semantic information.',
    fixSteps: [
      'Check spelling of all aria-* attributes against the WAI-ARIA specification',
      'Remove any custom or misspelled aria-* attributes',
    ],
    references: ['4.1.2'],
  },

  'aria-valid-attr-value': {
    summary: 'ARIA attributes must have valid values.',
    whoIsAffected: 'Screen reader users who depend on ARIA attribute values for widget state.',
    fixSteps: [
      'Check the WAI-ARIA specification for valid values for each attribute',
      'Ensure boolean attributes use "true" or "false"',
      'Ensure ID references point to existing elements',
    ],
    references: ['4.1.2'],
  },

  'aria-hidden-focus': {
    summary: 'Focusable elements must not be inside aria-hidden containers.',
    whoIsAffected: 'Screen reader and keyboard users who may focus elements that are hidden from the accessibility tree.',
    fixSteps: [
      'Remove focusable elements from aria-hidden containers',
      'Or add tabindex="-1" to focusable elements inside aria-hidden containers',
      'Or remove aria-hidden from the container if its content should be accessible',
    ],
    codeFixes: [
      { language: 'html', before: '<div aria-hidden="true">\n  <button>Close</button>\n</div>', after: '<div aria-hidden="true">\n  <button tabindex="-1">Close</button>\n</div>', notes: 'Ensure focusable elements inside aria-hidden are not in tab order.' },
    ],
    references: ['4.1.2'],
  },

  'aria-roles': {
    summary: 'ARIA role values must be valid.',
    whoIsAffected: 'Screen reader users who rely on roles to understand element purpose.',
    fixSteps: [
      'Use only valid WAI-ARIA role values from the specification',
      'Prefer native HTML semantic elements over ARIA roles when possible',
    ],
    references: ['4.1.2'],
  },

  // === Lists (WCAG 1.3.1) ===
  'list': {
    summary: 'List elements (<ul>, <ol>) must only contain <li>, <script>, or <template> children.',
    whoIsAffected: 'Screen reader users who rely on list structure for understanding grouped content.',
    fixSteps: [
      'Ensure <ul> and <ol> elements contain only <li> child elements',
      'Move non-list content outside the list or wrap it in <li> elements',
    ],
    wcagTechniques: ['H48'],
    references: ['1.3.1'],
  },

  'listitem': {
    summary: 'List items (<li>) must be contained within <ul> or <ol> parent elements.',
    whoIsAffected: 'Screen reader users who rely on proper list structure.',
    fixSteps: [
      'Wrap <li> elements in an appropriate <ul> or <ol> container',
    ],
    wcagTechniques: ['H48'],
    references: ['1.3.1'],
  },

  // === Tables (WCAG 1.3.1) ===
  'td-headers-attr': {
    summary: 'Table cell headers attribute must reference valid header cells.',
    whoIsAffected: 'Screen reader users navigating complex data tables.',
    fixSteps: [
      'Ensure headers attribute values match id attributes of <th> elements',
      'Remove invalid header references',
      'For simple tables, use <th> with scope attribute instead of headers',
    ],
    wcagTechniques: ['H43'],
    references: ['1.3.1'],
  },

  'th-has-data-cells': {
    summary: 'Table header cells must be associated with data cells.',
    whoIsAffected: 'Screen reader users who need header-cell relationships to understand table data.',
    fixSteps: [
      'Add scope="col" or scope="row" to <th> elements',
      'For complex tables, use id/headers attributes',
      'Ensure every <th> has corresponding <td> data cells',
    ],
    wcagTechniques: ['H51', 'H63'],
    references: ['1.3.1'],
  },

  'empty-table-header': {
    summary: 'Table header cells must not be empty.',
    whoIsAffected: 'Screen reader users who encounter empty headers while navigating tables.',
    fixSteps: [
      'Add descriptive text to all <th> elements',
      'If a header is not needed, use <td> instead',
    ],
    references: ['1.3.1'],
  },

  // === IDs (WCAG 4.1.2) ===
  'duplicate-id': {
    summary: 'ID attributes must be unique on the page.',
    whoIsAffected: 'Screen reader users - duplicate IDs break label associations and ARIA references.',
    fixSteps: [
      'Ensure each id attribute value is unique within the page',
      'Fix any label/for associations that may be broken',
      'Check ARIA references (aria-labelledby, aria-describedby) still point to correct elements',
    ],
    references: ['4.1.2'],
  },

  'duplicate-id-active': {
    summary: 'IDs on active focusable elements must be unique.',
    whoIsAffected: 'Keyboard and screen reader users - duplicate IDs on interactive elements cause unpredictable behavior.',
    fixSteps: [
      'Give each interactive element a unique id',
      'Update any references to the changed ids',
    ],
    references: ['4.1.2'],
  },

  // === Forms (WCAG 3.3.x) ===
  'form-field-multiple-labels': {
    summary: 'Form fields should not have multiple label elements.',
    whoIsAffected: 'Screen reader users who may hear conflicting or duplicated labels.',
    fixSteps: [
      'Remove duplicate <label> elements, keeping only one per form field',
      'If additional description is needed, use aria-describedby instead of a second label',
    ],
    wcagTechniques: ['H44'],
    references: ['3.3.2'],
  },

  'autocomplete-valid': {
    summary: 'Autocomplete attribute values must be valid and match the input purpose.',
    whoIsAffected: 'Users with cognitive disabilities and motor impairments who benefit from autocomplete.',
    fixSteps: [
      'Use valid autocomplete values from the HTML specification',
      'Match the autocomplete value to the actual input purpose (e.g., "email" for email fields)',
    ],
    wcagTechniques: ['H98'],
    references: ['1.3.5'],
  },
};
