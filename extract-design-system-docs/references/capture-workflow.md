# Page Capture Workflow

This document details the headless browser capture pipeline used by `scripts/capture-pages.mjs`.

## Rules & Constraints
1. **URL Input Count**: Minimum 3, Maximum 5.
2. **Domain Matching**: All URLs must share the same host domain (e.g. `example.com`), unless explicitly overridden.
3. **Viewports**:
   - Desktop: `1440 × 900`
   - Mobile: `390 × 844`
4. **Network Idle & Asset Loading**:
   - Wait for `domcontentloaded` and `networkidle`.
   - Wait for custom fonts to load (`document.fonts.ready`).
5. **Cookie Banners & Dialogs**:
   - Attempt non-intrusive dismissal of cookie banners/modals if present without performing sensitive actions (e.g. sign in, checkout).
6. **Redaction**:
   - Redact personal information, session tokens, or sensitive form fields before persisting page evidence.
