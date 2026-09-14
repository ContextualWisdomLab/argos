## 2024-05-25 - Icon Accessibility Pattern
**Learning:** Decorative icons from lucide-react were polluting the accessible name for screen readers because they were lacking aria-hidden="true". Even when the parent button has an aria-label, some screen readers announce the SVG element if it is not explicitly hidden.
**Action:** When adding or modifying decorative icons in interactive elements (like buttons or links), always include aria-hidden="true" on the icon component. Also, update tests to reflect aria-hidden="true".
