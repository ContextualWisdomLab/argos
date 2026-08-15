# Reusable asynchronous-action feedback

## Scope

This note records the accessibility and design-system boundary for organization and project mutation buttons that enter a pending state.

The implementation centralizes the repeated label-and-spinner object in `PendingActionLabel`. The owning native button retains responsibility for disabling duplicate activation and exposing `aria-busy` while the mutation is in flight.

## Standards interpretation

WAI-ARIA 1.3 defines `aria-busy` as a state indicating that an element is being modified and that assistive technologies may wait until modifications are complete before exposing descendant changes. The state is therefore useful metadata for the action control, but it is not treated as a guaranteed announcement mechanism.

WCAG 2.2 Success Criterion 4.1.2 requires names, roles, states, and values of user-interface components to be programmatically available. In this slice:

- the control remains a native button;
- its accessible name changes from the idle action to the existing pending action text;
- `disabled` prevents duplicate activation;
- `aria-busy` exposes the in-flight state;
- the spinner is decorative and removed from the accessibility tree;
- `focusable="false"` prevents legacy SVG focus behavior;
- `motion-reduce:animate-none` respects a reduced-motion preference while preserving the text state.

Status-message conformance is not claimed. A later rendered-browser and assistive-technology study should determine whether a separate live-region status is necessary for mutation completion and failure feedback. Adding a nested live region to every button without that evidence could create duplicate or noisy announcements.

## Component-system boundary

The repeated visual object is implemented once rather than copied across organization and project create/delete dialogs. Storybook should eventually document idle, pending, success, recoverable error, destructive, reduced-motion, keyboard, and narrow-viewport states. This PR does not claim that Storybook is already installed.

## Verification boundary

The focused tests establish:

1. no decorative spinner is rendered while idle;
2. pending text remains the button's accessible name;
3. the owning button exposes `disabled` and `aria-busy`;
4. the spinner is hidden from assistive technology and keyboard focus;
5. reduced-motion styling is present;
6. the create-project modal integrates the shared component.

Rendered contrast, timing, focus retention, screen-reader announcements, and reduced-motion computed styles remain browser-level checks.

## APA 7th references

World Wide Web Consortium. (2023, October 5). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

World Wide Web Consortium. (2026, June 4). *Accessible Rich Internet Applications (WAI-ARIA) 1.3* (Working Draft). https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/
