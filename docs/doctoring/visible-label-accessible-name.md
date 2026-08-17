# Visible labels and accessible control names

## Status

Active PR evidence only. This document describes the bounded dashboard-control repair on PR #381 and does not claim whole-product WCAG conformance or assistive-technology interoperability.

## Problem

The original Palette change replaced several button names with `aria-label` strings that did not preserve the text visible on screen. That is unsafe for controls whose visible text is already an appropriate name. WCAG 2.2 Success Criterion 2.5.3 requires a user-interface component's accessible name to contain the text presented visually, and the WAI-ARIA Authoring Practices Guide recommends visible text as the preferred source of accessible names. The APG also warns that `aria-label` on a button replaces descendant content in the accessibility tree.

The affected surfaces are:

- the Overview disclosure whose visible label is `What do these numbers mean?`;
- report `ContextSection` disclosure buttons whose visible label is the section title; and
- session-file summary actions whose visible labels include the actual file counts and state (`file modified`, `files modified`, `file read`, `files read`).

## Decision

1. **Overview disclosure:** keep the visible `What do these numbers mean?` text as the computed accessible name. Use `aria-expanded` to convey collapsed/expanded state rather than replacing the label with a state-dependent `aria-label`.
2. **Context sections:** keep the visible section title as the disclosure button name and as the stable `aria-labelledby` source for the controlled region. Use `aria-expanded` for state. Decorative chevrons are hidden from assistive technology.
3. **Session-file summary buttons:** retain the visible count/state text in the accessible name and append a visually hidden next-action suffix (`view modified files` or `view read files`). This preserves the visible label while giving screen-reader users the destination/action context.

This follows the APG disclosure model: a disclosure is a button whose state is represented by `aria-expanded`; `aria-controls` may identify the controlled content. It also keeps visible copy and programmatic naming aligned so voice-control users can target controls using words they can see.

## Executable acceptance evidence

The DOM regressions require:

- the Overview button to remain findable by `What do these numbers mean?` before and after expansion while `aria-expanded` changes from `false` to `true`;
- `ContextSection` buttons and their controlled regions to retain the section title as the accessible name across state changes; and
- file-summary actions to contain their visible count/status label in the computed accessible name while adding a nonvisual next-action suffix.

## Rollback

If the suffix wording causes an interoperability or usability regression, remove only the visually hidden action suffix and retain the visible-text naming model. Do not restore an overriding `aria-label` that omits visible label text.

## References

World Wide Web Consortium. (n.d.). *Understanding Success Criterion 2.5.3: Label in name*. Web Accessibility Initiative. Retrieved August 17, 2026, from https://www.w3.org/WAI/WCAG22/Understanding/label-in-name

World Wide Web Consortium. (n.d.). *Providing accessible names and descriptions*. WAI-ARIA Authoring Practices Guide. Retrieved August 17, 2026, from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/

World Wide Web Consortium. (n.d.). *Disclosure (show/hide) pattern*. WAI-ARIA Authoring Practices Guide. Retrieved August 17, 2026, from https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
