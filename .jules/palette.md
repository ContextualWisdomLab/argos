
## 2024-07-15 - ARIA Labels & Title Attributes

**Learning:** When using dynamic lists or icon-only buttons (like session delete buttons or date preset selectors), simply having an `aria-label` isn't always enough context. Adding a specific context (like the session name) to the `aria-label` and matching it with a visible `title` attribute greatly improves both screen reader experience and mouse user experience (via tooltips).
**Action:** Always check if a generic aria-label (e.g., "Delete") can be made more specific by interpolating the item's context (e.g., "Delete session: [Name]"). Ensure a matching `title` is present if the button is icon-only or has vague text (like "7d").
