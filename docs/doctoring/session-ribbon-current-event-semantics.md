# Session activity ribbon current-event semantics

## Status

Active PR only. This note describes the bounded accessibility behavior proposed for `SessionActivityRibbon`; it is not protected-branch product truth until the change is integrated.

## Decision

The ribbon exposes the visually highlighted timeline event as the current item in the related event set with `aria-current="true"`. It deliberately does not add `aria-pressed` to event-selection buttons.

The collapsed repeated-tool control is a command that expands a group. Activating it replaces that control with the individual event controls; the same DOM control does not remain present to represent both collapsed and expanded states. Its accessible name therefore states the next action, for example `Expand Read group, 2 events`, instead of asserting a persistent `aria-expanded` state that the component cannot truthfully maintain on the same control.

## Rationale

WAI-ARIA 1.2 defines `aria-current` for an element that represents the current item within a container or set of related elements and recommends marking only one item in a set as current. The current WAI-ARIA 1.3 Working Draft preserves that semantic. WCAG Technique ARIA26 likewise describes `aria-current` as a way to expose a current item that is otherwise visually highlighted.

The ARIA Authoring Practices button pattern reserves `aria-pressed` for a two-state toggle button. A timeline event button in this component is an action that makes an event current; pressing the same event does not toggle that event back to an unpressed state. Adding `aria-pressed` would therefore advertise a toggle contract that the product does not implement.

The ARIA Authoring Practices disclosure pattern expects the disclosure button itself to carry `aria-expanded=false` while its controlled content is hidden and `aria-expanded=true` while that content is visible. Because `SessionActivityRibbon` removes the collapsed group button when the group expands, the component currently has no persistent disclosure control on which that two-state contract can remain synchronized. The bounded repair uses an action-oriented name and keeps native button semantics instead of fabricating a partial disclosure widget.

## Verification contract

The focused DOM regression requires:

- exactly the visually selected event to expose `aria-current="true"`;
- non-current event actions not to expose `aria-current`;
- event actions not to expose `aria-pressed`;
- the collapsed repeated-tool command to be named by the next action and event count;
- the collapsed repeated-tool command not to expose `aria-expanded`; and
- activation to continue calling the existing `onToggleGroup(firstIdx)` callback.

This slice does not claim whole-product WCAG conformance, browser/screen-reader interoperability, a complete composite timeline keyboard model, or a persistent disclosure relationship. Those require separate executable evidence if claimed later.

## Rollback

Rollback removes the current-item attributes, action-oriented group label, focused regression, this note, and the corresponding Unreleased changelog entry together. It must not restore `aria-pressed` or a one-sided `aria-expanded=false` state unless the component is redesigned and tested as the corresponding full widget pattern.

## References

World Wide Web Consortium. (2023, June 6). *Accessible Rich Internet Applications (WAI-ARIA) 1.2*. https://www.w3.org/TR/wai-aria-1.2/

World Wide Web Consortium. (2026, June 4). *Accessible Rich Internet Applications (WAI-ARIA) 1.3* (Working Draft). https://www.w3.org/TR/wai-aria-1.3/

World Wide Web Consortium. (2026). *Button pattern*. WAI-ARIA Authoring Practices Guide. https://www.w3.org/WAI/ARIA/apg/patterns/button/

World Wide Web Consortium. (2026). *Disclosure (show/hide) pattern*. WAI-ARIA Authoring Practices Guide. https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

World Wide Web Consortium. (2026, March 9). *ARIA26: Using aria-current to identify the current item in a set*. Web Content Accessibility Guidelines 2.2 Techniques. https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA26
