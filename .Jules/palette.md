## 2023-10-27 - Icon-only buttons with dynamic counts
**Learning:** Buttons containing only icons and dynamic text counts (like "3 files modified") can be ambiguous for screen readers if the text isn't clearly associated with the action or context.
**Action:** Always add explicit `aria-label` attributes to such buttons to provide clear context (e.g., `aria-label="3 files modified"`).
