# Token Extraction & Normalization Guidelines

This document outlines the rules for converting raw computed style evidence into structured design token scales.

## Token Categories
1. **Colors**: Background, text, border, brand, surface, feedback (success, warning, error, info).
2. **Typography**: Font family, font size scale, line height, font weight, letter spacing.
3. **Spacing & Dimensions**: Padding, margin, layout gap, inline/block dimensions.
4. **Borders & Radii**: Border radius scale, border stroke width.
5. **Elevation & Shadows**: Box shadow, drop shadow, overlay opacities.

## Clustering Algorithm
- **Exact Duplicate Merging**: Identical color strings (e.g. `rgb(13, 110, 253)` and `#0d6efd`) are merged into a single primitive value.
- **Near-Duplicate Clustering**: Colors within a Delta-E threshold < 2.0 or pixel dimensions within ±1px tolerance are flagged as near-duplicates with an audit warning before consolidation.
- **Primitive Naming**: Hex/scale-based names (e.g., `color-blue-500`, `space-4`, `radius-md`).
- **Semantic Naming**: Role-based aliases (e.g., `color-action-primary`, `space-component-padding`).

## Conflict Resolution & Audit Log
When conflicting token values exist across pages (e.g., `#0d6efd` on page A vs `#0b5ed7` on page B for the primary button), both values are preserved in the `conflicts` audit section of `tokens.json`.
