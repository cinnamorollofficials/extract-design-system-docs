---
name: extract-design-system-docs
description: Analyzes 3 to 5 URLs from a single website or product, captures desktop and mobile rendered evidence, normalizes primitive and semantic design tokens, infers reusable components, and generates a single standalone index.html design system documentation with live previews and code snippets.
---

# Extract Design System Docs

Analyze 3–5 web pages from a single website/product and generate a single-file, standalone `index.html` design system documentation containing interactive component previews, design tokens, and code snippets.

## Trigger Rules

- **Positive Triggers**:
  - "Extract design system from https://example.com, https://example.com/about, https://example.com/pricing"
  - "Dokumentasikan design system dari 3-5 URL situs ini"
  - "Generate standalone design system docs for product URLs: ..."
  - "Ekstrak token dan komponen UI dari halaman-halaman berikut"
- **Negative Triggers**:
  - Building a new web application from scratch.
  - Designing a single landing page or simple UI feature.
  - Scanning a non-web repository without public URLs.

## Requirements & Constraints

1. **Input**: 3 to 5 public URLs belonging to the same product/domain.
2. **Viewports**: Desktop (`1440×900`) and Mobile (`390×844`).
3. **Output**: A single standalone file `<output-directory>/index.html` (default: `./output/index.html`).
4. **Offline Portability**: The generated `index.html` must work without external servers or build processes. All CSS, JavaScript, and token schemas must be inline or data URIs.
5. **Provenance & Confidence**: Every inferred token and component must retain source URL, viewport, selector, property, and confidence rating (`confirmed`, `inferred`, `speculative`).

## Workflow Steps

### Step 1: Capture Evidence
Run page capture script across the 3–5 target URLs:
```bash
node extract-design-system-docs/scripts/capture-pages.mjs --urls "https://example.com/1,https://example.com/2,https://example.com/3"
```
Refer to [capture-workflow.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/capture-workflow.md) for details on DOM, computed style, and viewport capture logic.

### Step 2: Normalize Design Tokens
Process captured raw evidence to produce primitive and semantic tokens:
```bash
node extract-design-system-docs/scripts/normalize-tokens.mjs
```
Refer to [token-inference.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/token-inference.md) for color, typography, spacing, radius, and shadow clustering guidelines.

### Step 3: Infer UI Components
Group repeating DOM subtrees into reusable UI components, variants, and observed states:
```bash
node extract-design-system-docs/scripts/infer-components.mjs
```
Refer to [component-inference.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/component-inference.md) for component anatomy and variant matrix rules.

### Step 4: Generate Standalone HTML Documentation
Build the single-file `index.html` documentation bundle:
```bash
node extract-design-system-docs/scripts/generate-docs.mjs --output ./output/index.html
```
Refer to [html-output-contract.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/html-output-contract.md) for documentation shell layout, Shadow DOM preview isolation, and snippet requirements.

### Step 5: Validate Output
Validate the generated HTML file:
```bash
node extract-design-system-docs/scripts/validate-output.mjs --input ./output/index.html
```

## References Directory
- [evidence-schema.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/evidence-schema.md)
- [capture-workflow.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/capture-workflow.md)
- [token-inference.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/token-inference.md)
- [component-inference.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/component-inference.md)
- [confidence-and-provenance.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/confidence-and-provenance.md)
- [html-output-contract.md](file:///Users/hadiyahku/code/ds-skill/extract-design-system-docs/references/html-output-contract.md)
