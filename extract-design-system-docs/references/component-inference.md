# Component Inference & Inventory Guidelines

This document details how structural DOM patterns are extracted, classified, and represented as component specifications.

## Component Grouping Criteria
1. **Repeating DOM Signature**: Elements sharing structural hierarchy, CSS class conventions, or explicit ARIA roles across 2 or more captured pages.
2. **Standard Component Types**:
   - Buttons, Badges, Chips, Avatars
   - Inputs, Textareas, Selects, Checkboxes, Switches
   - Cards, Modals, Accordions, Tabs, Navbars, Footers, Alerts

## Anatomy & Variants
- **Anatomy**: Slots and child nodes (e.g. `Button` = `[prefix-icon, label, suffix-icon]`).
- **Variants**: Axes such as `variant` (primary, secondary, outline, ghost), `size` (sm, md, lg), and `state` (default, hover, focus, disabled).
- **Observed vs Inferred States**: Only states directly captured during interaction or DOM state observation are marked as `confirmed`. Unobserved reconstructed states are labeled `speculative`.
