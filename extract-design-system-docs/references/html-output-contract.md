# HTML Output Contract

This document specifies the structure, accessibility, and offline portability requirements for the generated standalone `index.html` file.

## Output File Requirements
1. **Single File**: Produced at `<output-directory>/index.html` (default `./output/index.html`).
2. **Zero External Runtime Dependencies**: All CSS, JS, font definitions, and token data must be inlined into the HTML.
3. **Responsive Shell**: Includes a left-hand navigation sidebar, top search bar, theme switcher, section links, and audit report.

## Live Component Previews
- **Isolation**: Preview containers use Shadow DOM or `iframe srcdoc` to prevent documentation styles from leaking into component previews, and vice versa.
- **Interactive Controls**: State/variant toggles for previewing components in different states without making network requests.
- **Copyable Snippets**: Code snippets (HTML, CSS custom properties, vanilla JS) generated directly from the canonical component model.
