# Date-range and session-action accessibility

## Status

Active PR work only. This document does not claim protected-`developmental` integration or whole-product WCAG conformance.

## Buyer-visible problem

Two compact controls lacked enough context for some assistive-technology and pointer users:

- the date-range preset buttons showed terse labels (`7d`, `30d`, `90d`, `ALL`) without a programmatic group name or a separate explanation of each abbreviation; and
- the icon-only session delete action used the same accessible name for every row, so a user navigating a table of sessions could not identify the deletion target from the button name alone.

The existing logout buttons are not changed by this slice. They already have visible text plus a programmatic name containing that visible text, so adding duplicate `title` text would not address the remaining buyer gap.

## Decision

### Date-range presets

Preserve each visible button label as its accessible name. The preset container is named `Date range presets`, and each button points through `aria-describedby` to a short explanation such as `Last 7 days` or `All available history`. A per-component `useId()` prefix prevents description-ID collisions if more than one picker is rendered.

This deliberately avoids replacing visible child text with `aria-label`. WAI-ARIA Authoring Practices recommends visible text as the robust source for button names when it is already suitable, while WCAG 2.2 Label in Name requires visible label text to remain in the accessible name for controls that expose an additional programmatic name.

### Session delete action

The delete control is icon-only, so a string accessible name is appropriate. The button uses the formatted visible session title when available (`세션 삭제: <title>`) and falls back to `세션 삭제` when no useful title exists. The same text is exposed through `title` as a pointer tooltip, but the accessibility contract does not depend on `title` support.

## Executable evidence

- `date-range-picker.test.tsx` renders the real component, verifies the named group, preserves the exact visible button names, and follows every `aria-describedby` reference to the expected explanation.
- `session-delete-action-contract.test.ts` guards the currently inline session-table action until that row is separately extracted into an independently renderable component. The page already has end-to-end delete confirmation and mutation behavior; this bounded contract prevents the target-specific name from silently regressing without forcing an unrelated component refactor into this slice.

## Rollback

Rollback the date-range descriptions, session-target labels, focused tests, this doctoring note, and the matching Unreleased changelog entry together. Do not roll back the pre-existing `aria-pressed` state or keyboard focus ring.

## References

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

World Wide Web Consortium, Web Accessibility Initiative. (n.d.). *Providing accessible names and descriptions*. WAI-ARIA Authoring Practices Guide. https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/

World Wide Web Consortium, Web Accessibility Initiative. (n.d.). *Understanding Success Criterion 2.5.3: Label in Name*. https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html

World Wide Web Consortium, Web Accessibility Initiative. (n.d.). *Understanding Success Criterion 4.1.2: Name, Role, Value*. https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html
