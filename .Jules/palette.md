## 2025-06-16 - Accessible Collapsible Sections
**Learning:** Decorative typography used for visual indication of state (like "▸" and text explaining the state "click to expand") creates redundant and confusing noise for screen readers if the button itself already has an `aria-expanded` attribute.
**Action:** Always semantically link collapsible toggle buttons to their content container using `aria-controls` and `id`, indicate the toggle state with `aria-expanded`, and explicitly hide any purely decorative state-indicating elements inside the button using `aria-hidden="true"`.
