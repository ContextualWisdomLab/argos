# Product technical gap baseline

Status: Proposed
Pull request: #713
Base reviewed: `developmental@2fa92012bcf80acc1f921a4bafea76b3b1424b46`
Accessibility contract repair head: `49bec52b50f9edffe506225016a825d4e24c7480`
CHANGELOG evidence head: `bb11640923beeb1c6d52b0297376887f584f2580`

## Goal and boundary

Argos owns the dashboard controls and their presentation semantics. Decorative Chevron icons may be removed from the accessibility tree only when the enclosing button, link, or select trigger retains its product-owned accessible name and interaction state. Presentation markup does not replace timeline or report domain truth.

## Root cause

The proposed source changes added `aria-hidden="true"`, but the initial tests inspected SVG attributes without proving that the enclosing controls remained named. The branch also contained `patch-event-list-test.js`, a temporary speculative patch script with no runtime, test, or documentation responsibility. The repair removes that file and adds role/name assertions for the affected event group, week links, pagination buttons, and select trigger while retaining the icon assertions.

## Exact-head acceptance matrix

| Capability | Current evidence | Status | Required action |
| --- | --- | --- | --- |
| Determinism | Attribute and role/name assertions use fixed rendered fixtures | GREEN (source contract) | Run exact-head Vitest |
| Semantics | Event group keeps `aria-expanded`; navigation, pagination, and trigger names remain discoverable | GREEN (source contract) | Verify browser accessibility tree |
| Keyboard/pointer/touch | Existing controls remain native button/link primitives | NOT REVALIDATED | Exercise keyboard, pointer, and touch on exact head |
| Loading/empty/error/offline/permission/read-only/stale/conflict/retry/busy | No state behavior changed by this icon-only delta | NOT REVALIDATED | Cover applicable dashboard states before merge |
| Responsive evidence | No current-head desktop/mobile/intermediate screenshots | FAIL | Capture all three viewport classes |
| WCAG 2.2 AA/reduced motion | Decorative SVG contract is present; real AT, contrast, target-size, and motion evidence is absent | FAIL | Run axe and assistive-technology audit |
| Locales | Control labels in the touched surfaces are not evidenced for ko/en/ja/zh/vi/es/de/fr | FAIL | Run locale rendering and wrapping checks |
| Large data/performance | Virtualized event-list behavior is mocked; production-size rendering is not measured | FAIL | Run real-list performance and lifecycle cleanup checks |
| Import/export/recovery | Not affected by the icon-only delta | NOT APPLICABLE | Reclassify if scope expands |

## Merge gate

Keep Draft until exact-head hosted Checks and required review are terminal GREEN and all applicable browser, responsive, accessibility, locale, and performance evidence is attached. Queued, skipped, mocked-only, or predecessor-head results are not acceptance.
