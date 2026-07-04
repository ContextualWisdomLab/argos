## 2025-07-04 - Accessible IDs for reusable components
**Learning:** Hardcoded `id` and `aria-controls` attributes in React components (like `overview-stats.tsx`) cause critical accessibility regressions when the component is rendered multiple times, as screen readers lose the ability to accurately link the toggle button to the expanding content.
**Action:** Always use React's `useId()` hook to generate globally unique identifiers for ARIA attributes linking dynamic elements, particularly in generic UI components intended for reuse across different pages or layouts.
