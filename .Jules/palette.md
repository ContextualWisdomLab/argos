## 2024-10-27 - [Add ARIA attributes for collapsible UI sections]
**Learning:** For accessibility in collapsible UI sections, semantically link the toggle button to the content container using `aria-controls` and `aria-expanded`, and hide visual-only decorative elements using `aria-hidden="true"` to reduce screen reader noise.
**Action:** Always add `aria-expanded` and hide decorative elements such as chevrons in collapsible UI components.
