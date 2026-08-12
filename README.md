# Extract Design System Docs — AI Agent Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

An AI Agent Skill that analyzes 3 to 5 public web pages from a single website or product, captures rendered DOM evidence across desktop (`1440×900`) and mobile (`390×844`) viewports, extracts primitive and semantic design tokens with source provenance & confidence scores, infers reusable UI components, and bundles everything into a single, standalone `index.html` documentation file with live previews and copyable code snippets.

---

## 🛠️ Features

- **3–5 URL Multi-Page Evidence Capture**: Extracts DOM elements, computed styles, CSS variables (`:root`), font metadata, and viewport screenshots.
- **Token Normalization & Clustering**: Groups exact and near-duplicate colors, typography scales, spacing, radius, and shadows into primitive tokens and semantic aliases.
- **Component Inference Engine**: Identifies repeating UI patterns (Buttons, Headings, Inputs, Cards, Links) with anatomy, variant axes, and observed states.
- **Single-File Standalone HTML Output**: Generates a self-contained `index.html` document with zero external runtime network dependencies.
- **Isolated Component Previews**: Renders component previews isolated from documentation shell styles.
- **Built-in Validation & Testing**: Automated HTML syntax, accessibility, keyboard operability, and offline portability validator.

---

## 📁 Repository Structure

```text
extract-design-system-docs/
├── README.md                           # Main repository documentation
├── TODO.md                             # Specification checklist & milestones
├── package.json                        # Node dependencies & script runners
├── extract-design-system-docs/         # The AI Skill Bundle
│   ├── SKILL.md                        # AI Agent prompt instructions & triggers
│   ├── agents/
│   │   └── openai.yaml                 # Agent integration metadata
│   ├── assets/
│   │   └── documentation-shell/        # Responsive HTML shell template
│   ├── references/                     # Detailed technical specifications
│   │   ├── schemas/                    # JSON Schemas for data validation
│   │   ├── fixtures/                   # Sample JSON data fixtures
│   │   ├── capture-workflow.md
│   │   ├── token-inference.md
│   │   ├── component-inference.md
│   │   ├── confidence-and-provenance.md
│   │   ├── evidence-schema.md
│   │   └── html-output-contract.md
│   └── scripts/                        # ESM Node.js Execution Scripts
│       ├── capture-pages.mjs
│       ├── normalize-tokens.mjs
│       ├── infer-components.mjs
│       ├── generate-docs.mjs
│       ├── validate-output.mjs
│       └── lib/
│           └── schema-validator.mjs
└── test/
    └── pipeline.test.mjs               # End-to-end pipeline test runner
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 2. Installation
```bash
git clone https://github.com/cinnamorollofficials/extract-design-system-docs.git
cd extract-design-system-docs
npm install
```

### 3. Run the Pipeline

#### Step 1: Capture Target Web Pages
```bash
npm run capture -- --urls "https://example.com/,https://example.com/pricing,https://example.com/about" --output ./output
```

#### Step 2: Normalize Design Tokens
```bash
npm run normalize -- --input ./output/evidence --output ./output
```

#### Step 3: Infer UI Components
```bash
npm run infer -- --input ./output/evidence --output ./output
```

#### Step 4: Generate Standalone `index.html` Documentation
```bash
npm run generate -- --input ./output --output ./output/index.html
```

#### Step 5: Validate Output Document
```bash
npm run validate -- --input ./output/index.html
```

---

## 🧪 Running Tests

Run the full end-to-end pipeline test suite:
```bash
npm test
```

---

## 📄 License

[MIT](LICENSE)
