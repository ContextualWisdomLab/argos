# Overview statistics disclosure identity

## Decision

`OverviewStats` uses one React `useId()` value as the stable prefix for the
instance's disclosure button and explanation region. The button and region then
receive distinct suffixes:

```text
<react-generated-id>-toggle
<react-generated-id>-content
```

The native button owns `aria-expanded` and `aria-controls`. The controlled
explanation is a named `region` whose `aria-labelledby` points back to the same
button. The region remains in the DOM and uses the native `hidden` state so the
expanded state and controlled content stay deterministic.

This replaces repository-global static IDs. A page can render multiple overview
cards without duplicate identifiers or cross-linking one button to another
card's content. React documents `useId` as the hook for generating unique IDs
for accessibility attributes and notes that it remains hydration-compatible
when the server and client component trees match.

## Scope and claim boundary

This change establishes unique, reciprocal DOM relationships and independent
expanded state for repeated `OverviewStats` instances. It does not claim full
WCAG conformance, screen-reader equivalence across every browser, or visual
focus compliance. The existing native button and focus-visible ring remain
unchanged. Whole-product accessibility still requires rendered browser,
keyboard, zoom, contrast, and assistive-technology evaluation.

The ARIA `region` role is deliberately named by the controlling button. It is
appropriate here because the expanded content explains a bounded, user-invoked
section of the dashboard. The implementation does not create a region around
every statistic tile.

## Verification

`overview-stats.test.tsx` renders two cards simultaneously and proves:

1. both buttons and both regions have non-empty unique IDs;
2. each `aria-controls` references only its same-instance region;
3. each `aria-labelledby` references only its same-instance button;
4. both disclosures begin collapsed; and
5. activating the first button does not expand the second disclosure.

Repository lint, type checking, complete tests, production build, security
scans, current-head review, and branch protection remain authoritative. Rollback
requires restoring a different collision-free ID mechanism; restoring static
repository-global IDs is not an acceptable rollback.

## References

React. (n.d.). *useId*. Retrieved August 5, 2026, from
https://react.dev/reference/react/useId

World Wide Web Consortium. (2024). *Web Content Accessibility Guidelines
(WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

World Wide Web Consortium. (2025). *WAI-ARIA Authoring Practices 1.2*.
https://www.w3.org/WAI/ARIA/apg/
