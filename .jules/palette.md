## 2024-05-24 - Add accessibility attributes to overview stats expander
**Learning:** Collapsible sections need explicit semantic linkage between the toggle and the content, as well as state indication, to be accessible to screen reader users. Decorative visual cues like arrows can add noise for screen readers.
**Action:** Always add `aria-expanded`, `aria-controls`, and an `id` to link toggle buttons to the content they control. Use `aria-hidden="true"` on non-semantic decorative icons.
