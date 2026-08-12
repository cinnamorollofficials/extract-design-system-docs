# Confidence & Provenance Model

Every token, component, variant, and state produced by `extract-design-system-docs` must retain verifiable provenance and a confidence score.

## Confidence Level Enum
1. `confirmed`: Directly observed in the rendered DOM or computed CSS of at least one page evidence capture.
2. `inferred`: Derived algorithmically (e.g. semantic alias deduced from element class name or ARIA role).
3. `speculative`: Reconstructed placeholder for standard states (e.g. `hover` or `disabled`) that were not explicitly captured from live interactions.

## Provenance Tracking Schema
```json
{
  "sourceUrl": "https://example.com/pricing",
  "viewport": "desktop",
  "selector": "main > section.pricing-cards > div.card:nth-child(1) > button.btn",
  "cssProperty": "background-color",
  "observedValue": "rgb(13, 110, 253)"
}
```
