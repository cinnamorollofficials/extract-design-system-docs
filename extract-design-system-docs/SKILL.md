---
name: extract-design-system-docs
description: Analyzes 3 to 5 URLs from a single website or product, captures desktop and mobile rendered evidence, normalizes design tokens, infers reusable components, and uses AI agent design reasoning to produce a standalone index.html documentation file with live previews and code snippets.
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
Run page capture script across the target 3–5 URLs:
```bash
node extract-design-system-docs/scripts/capture-pages.mjs --urls "https://example.com/1,https://example.com/2,https://example.com/3" --output ./output
```

### Step 2: Normalize Tokens & AI Design Synthesis
Run token normalization to generate primitive scales:
```bash
node extract-design-system-docs/scripts/normalize-tokens.mjs --input ./output/evidence --output ./output
```
**AI Agent Enhancement**: Inspect `tokens.json` to assign brand-aware semantic token names (e.g., mapping brand hex colors to `--color-brand-primary`), organize spacing scales, and document design intent.

### Step 3: Component Inference & Creative Refactoring
Run component inference:
```bash
node extract-design-system-docs/scripts/infer-components.mjs --input ./output/evidence --output ./output
```
**AI Agent Enhancement**: Inspect `components.json`. Refactor raw element HTML into clean, modern, accessible HTML5 component templates (e.g. semantic buttons, input fields, cards, navbars) and write human-readable usage guidelines & accessibility tips.

### Step 4: Generate Standalone HTML Documentation
Build the single-file `index.html` documentation bundle:
```bash
node extract-design-system-docs/scripts/generate-docs.mjs --input ./output --output ./output/index.html
```

### Step 5: Validate Output
Validate the final HTML output document:
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
