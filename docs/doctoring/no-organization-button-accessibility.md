# No-organization button accessibility evidence

## Decision

The no-organization state keeps both user actions as native buttons while making their contracts explicit:

- the logout action uses `type="button"` so later composition inside a form cannot turn it into an unintended submit control;
- the logout action exposes a visible keyboard focus indicator;
- the `PlusIcon` beside the already descriptive `조직 수동 생성` text is marked `aria-hidden="true"` because it is redundant decoration, while the visible text remains the accessible name.

## Verification contract

The DOM regression test proves the shipped component, rather than a helper in isolation:

1. logout is discoverable by its accessible name;
2. logout is non-submitting and has the repository focus-ring utilities;
3. logout dispatches the intended sign-out callback;
4. the decorative icon is absent from the accessibility tree contract; and
5. activating the create button opens the real organization dialog and exposes its visible title and labelled name input.

## Standards traceability

WCAG 2.2 Success Criterion 2.4.7 requires keyboard-operable interfaces to provide a mode with a visible keyboard focus indicator. The HTML Living Standard defines `button` as the inert, non-submitting `type` keyword and otherwise allows a missing type to become a submit button under the Auto-state conditions. WAI-ARIA permits `aria-hidden="true"` for visibly rendered content only when removing redundant or extraneous content improves the assistive-technology experience and equivalent meaning remains exposed.

## References

Web Accessibility Initiative. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. World Wide Web Consortium. https://www.w3.org/TR/WCAG22/

Web Accessibility Initiative. (2026, June 4). *Accessible Rich Internet Applications (WAI-ARIA) 1.3* [Working draft]. World Wide Web Consortium. https://www.w3.org/TR/wai-aria-1.3/

WHATWG. (2026). *HTML standard: The button element*. https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element
