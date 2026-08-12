# Evidence Schema & Intermediate Data Models

This document defines the schema contracts for intermediate data artifacts gathered during the capture and inference phases.

## 1. Job Configuration Schema (`job-config.json`)
```json
{
  "targetUrls": ["https://example.com", "https://example.com/pricing", "https://example.com/about"],
  "viewports": [
    { "name": "desktop", "width": 1440, "height": 900 },
    { "name": "mobile", "width": 390, "height": 844 }
  ],
  "outputDirectory": "./output",
  "policy": {
    "redactPII": true,
    "allowExternalAssets": false
  }
}
```

## 2. Raw Style & DOM Evidence (`page-evidence.json`)
Captures per-page observations including computed styles, CSS variables, typography metrics, and component nodes.

```json
{
  "pageUrl": "https://example.com",
  "finalUrl": "https://example.com/",
  "title": "Example Homepage",
  "timestamp": "2026-08-12T16:00:00Z",
  "viewport": "desktop",
  "cssVariables": {
    "--primary-color": "#0d6efd",
    "--spacing-md": "16px"
  },
  "fontFamilies": ["Inter", "system-ui", "sans-serif"],
  "elements": [
    {
      "selector": "button.btn-primary",
      "tagName": "BUTTON",
      "text": "Get Started",
      "computedStyle": {
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(13, 110, 253)",
        "borderRadius": "8px",
        "fontSize": "16px",
        "fontWeight": "600",
        "paddingTop": "12px",
        "paddingBottom": "12px",
        "paddingLeft": "24px",
        "paddingRight": "24px"
      },
      "attributes": {
        "class": "btn btn-primary"
      }
    }
  ]
}
```

## 3. Token Model (`tokens.json`)
Contains normalized primitive scales and semantic aliases.

## 4. Component Inventory (`components.json`)
Contains inferred component specifications, variants, and observed states.
