# Product technical gap baseline

Status: Proposed
Pull request: #723
Predecessor provenance: #713
Base reviewed: `developmental@2fa92012bcf80acc1f921a4bafea76b3b1424b46`
Regression heads: `3d54ba11dab1fb73c502e6d320a9c377169200f1`, `a9aab591bd9724ad44515560d22549f9d46d4060`
Successor source tree: `48bb9feb25485bed3faa4f40e3818b1cb0575723`
CI RED evidence head: `46c045b949be88aef49f341dcc390941b920ef7a`
Accessible-name repair head: `30064154499c8114d052338d654f4c4f3b2e6849`

## Goal and boundary

Argos owns the dashboard controls and their presentation semantics. Decorative Chevron icons may be removed from the accessibility tree only when the enclosing button, link, or select trigger retains its product-owned accessible name and interaction state. Presentation markup does not replace timeline or report domain truth.

## Root cause and repair

Commits `3d54ba11dab1fb73c502e6d320a9c377169200f1` and `a9aab591bd9724ad44515560d22549f9d46d4060` corrected or retained TypeScript test-double shapes but repeatedly removed the observable role/name/state assertions, the CHANGELOG entry, and this Gap baseline. Direct repair on the shared writer was therefore not durable. Draft successor #723 preserves the complete valid tree, including the type corrections, event-group `aria-expanded`, week-navigation, pagination, and select-trigger accessible names. Exact-head CI run `36718771104` then proved that implicit child-text naming produced the concatenated name `ToolTestTool x20:00:00`, so the disclosure control now derives an explicit accessible name from its existing label and preview while leaving elapsed time visual. No component or dependency was added.

## Exact-head acceptance matrix

| Capability | Current evidence | Status | Required action |
| --- | --- | --- | --- |
| Determinism | CI RED at `46c045b...` reproduced the concatenated disclosure name; the existing fixture now exercises the explicit label/preview name | REPAIR COMMITTED; NEW CHECKS REQUIRED | Run exact-head Vitest |
| Semantics | Event group now exposes `Tool TestTool x2` without elapsed-time pollution and retains `aria-expanded`; navigation, pagination, and trigger names remain discoverable | GREEN (source contract) | Verify browser accessibility tree |
| Keyboard/pointer/touch | Existing controls remain native button/link primitives | NOT REVALIDATED | Exercise keyboard, pointer, and touch on exact head |
| Loading/empty/error/offline/permission/read-only/stale/conflict/retry/busy | No state behavior changed by this icon-only delta | NOT REVALIDATED | Cover applicable dashboard states before merge |
| Responsive evidence | No current-head desktop/mobile/intermediate screenshots | FAIL | Capture all three viewport classes |
| WCAG 2.2 AA/reduced motion | Source semantics restored; real AT, contrast, target-size, and motion evidence is absent | FAIL | Run axe and assistive-technology audit |
| Locales | Touched control labels lack ko/en/ja/zh/vi/es/de/fr evidence | FAIL | Run locale rendering and wrapping checks |
| Large data/performance | Virtualized event-list behavior is mocked; production-size rendering is not measured | FAIL | Run real-list performance and lifecycle cleanup checks |
| Import/export/recovery | Not affected by the icon-only delta | NOT APPLICABLE | Reclassify if scope expands |

## Merge gate

Keep Draft until exact-head hosted Checks and required review are terminal GREEN and all applicable browser, responsive, accessibility, locale, and performance evidence is attached. Queued, skipped, mocked-only, or predecessor-head results are not acceptance.
