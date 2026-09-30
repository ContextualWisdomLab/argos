# Product technical gap baseline

Status: Proposed
Pull request: #723
Predecessor provenance: #713
Base reviewed: `developmental@2fa92012bcf80acc1f921a4bafea76b3b1424b46`
Regression heads: `3d54ba11dab1fb73c502e6d320a9c377169200f1`, `a9aab591bd9724ad44515560d22549f9d46d4060`
Successor source tree: `48bb9feb25485bed3faa4f40e3818b1cb0575723`
CI RED evidence head: `46c045b949be88aef49f341dcc390941b920ef7a`
Accessible-name repair head: `30064154499c8114d052338d654f4c4f3b2e6849`
Security evidence head: `0aaa15972f6c0fdd1da58dfe353be23264d02021`

## Goal and boundary

Argos owns the dashboard controls and their presentation semantics. Decorative Chevron icons may be removed from the accessibility tree only when the enclosing button, link, or select trigger retains its product-owned accessible name and interaction state. Presentation markup does not replace timeline or report domain truth.

Shared web dependency remediation remains separately owned by Draft PR #615 at `96e41e67af7d9fc44fc075c073b6544d92f541a9`. PR #723 must inherit that delta through ordinary integration and non-force reconciliation rather than copying package or lock changes.

## Root cause and repair

Commits `3d54ba11dab1fb73c502e6d320a9c377169200f1` and `a9aab591bd9724ad44515560d22549f9d46d4060` corrected or retained TypeScript test-double shapes but repeatedly removed the observable role/name/state assertions, the CHANGELOG entry, and this Gap baseline. Direct repair on the shared writer was therefore not durable. Draft successor #723 preserves the complete valid tree, including the type corrections, event-group `aria-expanded`, week-navigation, pagination, and select-trigger accessible names.

CI run `36725767947` is terminal success at `0aaa15972f6c0fdd1da58dfe353be23264d02021`, proving the explicit event-group accessible name repair. Semgrep is also terminal success.

Security run `36725767062`, Trivy job `109933128397`, checked out the same exact head and reported seven protected-base findings: CVE-2026-45819 in `baseline-browser-mapping`; CVE-2026-73088 and CVE-2026-73089 in `browserslist`; CVE-2026-40345 in `deepmerge-ts`; CVE-2026-75604 and GHSA-2xp9-vwfh-vxw4 in `next`; and GHSA-rgj7-g3m4-5g8c in `sharp`. Canonical owner #615 upgrades those dependency families and has GREEN CI/Security/Semgrep evidence, but required CodeQL run `34734711692` remains failed. Neither owner nor consumer is merge-ready.

## Exact-head acceptance matrix

| Capability | Current evidence | Status | Required action |
| --- | --- | --- | --- |
| Determinism | CI `36725767947` passed the repaired disclosure contract on exact head | GREEN — hosted CI | Preserve after owner integration |
| Semantics | Event group exposes `Tool TestTool x2` without elapsed-time pollution and retains `aria-expanded`; other control names remain discoverable | GREEN — hosted CI | Verify browser accessibility tree |
| Dependency security | Exact-head Trivy reproduced seven shared web dependency findings; #615 owns the clean versions | FAIL — OWNER ROUTED | Clear #615 CodeQL/review, integrate normally, non-force reconcile #723, rerun every gate |
| Keyboard/pointer/touch | Existing controls remain native button/link primitives | NOT REVALIDATED | Exercise keyboard, pointer, and touch on exact head |
| Loading/empty/error/offline/permission/read-only/stale/conflict/retry/busy | No state behavior changed by this icon-only delta | NOT REVALIDATED | Cover applicable dashboard states before merge |
| Responsive evidence | No current-head desktop/mobile/intermediate screenshots | FAIL | Capture all three viewport classes |
| WCAG 2.2 AA/reduced motion | Source semantics restored; real AT, contrast, target-size, and motion evidence is absent | FAIL | Run axe and assistive-technology audit |
| Locales | Touched control labels lack ko/en/ja/zh/vi/es/de/fr evidence | FAIL | Run locale rendering and wrapping checks |
| Large data/performance | Virtualized event-list behavior is mocked; production-size rendering is not measured | FAIL | Run real-list performance and lifecycle cleanup checks |
| Import/export/recovery | Not affected by the icon-only delta | NOT APPLICABLE | Reclassify if scope expands |

## Merge gate

Keep Draft until #615 is integrated and #723 is non-force reconciled, exact-head hosted Checks and required review are terminal GREEN, and all applicable browser, responsive, accessibility, locale, and performance evidence is attached. Queued, skipped, mocked-only, or predecessor-head results are not acceptance.
