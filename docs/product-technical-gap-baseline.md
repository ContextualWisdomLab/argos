# Argos product–technical gap baseline

Status: Proposed / code-current baseline  
Evidence generation: `cef6664011f45fc9fa0f1998726d84ee4b04d510` on PR #596, protected target `developmental@2fa92012bcf80acc1f921a4bafea76b3b1424b46`  
Last reviewed: 2026-09-08

## Product boundary

Argos is a team-level analytics product for Claude Code and Codex usage. The repository owns the CLI/hook collection path, the web dashboard, organization/project/session analytics, and the PostgreSQL-backed application data model. The monorepo is pnpm + Turborepo; `packages/web` is the Next.js dashboard, `packages/shared` contains shared schemas/types, and `packages/cli` publishes `argos-ai`.

This repository owns Argos domain truth. Cross-product platform capabilities must be consumed through released contracts rather than copied source or mutable sibling heads.

## Bounded contexts and invariants

### Collection

The CLI/hook path observes agent activity and sends events without blocking the observed developer workflow. ADR-005 and ADR-006 make fire-and-forget collection and tolerated event loss explicit trade-offs. The collection boundary must not turn observability failure into developer-workflow failure.

### Organization and project access

Organization membership, project identity, RBAC and individual-data access determine which session data a caller may read or export. Export code must preserve the same authorization scope as its source dashboard/API query; formatting must not become an authorization bypass.

### Session analytics and export

A session export is a projection of already-authorized session records. CSV serialization is an output-boundary responsibility: field quoting, delimiter containment and spreadsheet formula interpretation must be handled without mutating numeric semantics or allowing attacker-controlled text to become executable spreadsheet formulas.

Invariant for text fields: no exported cell may begin, after CSV parsing, with a spreadsheet formula-triggering prefix from the supported target applications. Numeric values retain numeric representation. Quotes, delimiters, CR and LF remain valid data and must not create additional cells.

## Current gap register

| Gap | Buyer/control impact | Current evidence | Acceptance |
| --- | --- | --- | --- |
| CSV/spreadsheet formula interpretation | An authorized user can export attacker-controlled session/project text and later open it in a spreadsheet; an unsafe cell can be interpreted as a formula. | PR #596 extracts `csvField()` and tests `=`, `+`, `-`, `@`, tab, CR/LF, leading spaces, quote/comma containment and full-width trigger variants. Unrelated dependency override churn and branch-local Sentinel doctrine were removed in normal descendants. | Exact-head unit/type/lint/security gates must be terminal GREEN; raw CSV must preserve one field per input field; at least the spreadsheet applications used by the product's target environment must be checked with benign formula payloads. Excel save/re-open behavior must be included if Excel is a supported target. |
| Spreadsheet-specific mitigation portability | There is no universal CSV escaping scheme that behaves identically across Excel, LibreOffice and other consumers. | OWASP notes that quote/apostrophe escaping can be removed or become ineffective after Excel save/re-open, and describes application-dependent alternatives. | Document the supported spreadsheet target(s). Keep the serializer contract tied to observed target behavior; do not claim universal prevention from unit tests alone. |
| Canonical commercial gap baseline | This file did not exist on protected `developmental` before PR #596, so product/security work had no single code-current Gap projection. | Protected-base lookup returned no `docs/product-technical-gap-baseline.md`. | Maintain this file alongside PRD/ADR/code changes and record exact evidence generations rather than aspirational completion claims. |

## PR #596 decision record

Problem: the sessions CSV exporter serialized untrusted text using syntactic CSV quoting only. CSV quoting prevents delimiter breakout but does not by itself prevent a spreadsheet from interpreting a cell beginning with a formula trigger.

Constraints: preserve authorized data, preserve raw numeric values, keep the deterministic formatting logic independently testable, avoid unrelated dependency/security-policy churn, and do not overstate spreadsheet-specific security without real application evidence.

Alternatives considered:

1. Leave CSV quoting unchanged. Rejected because spreadsheet formula interpretation is outside RFC-style CSV delimiter escaping.
2. Reject formula-like values. Rejected because session/project text is domain data and should not be discarded at export.
3. Prefix risky string cells with a text marker and retain CSV quote escaping. Selected as the current candidate because it preserves the original text visibly while keeping the formatting rule localized in a pure function.
4. Claim universal spreadsheet safety from the serializer unit tests. Rejected. Spreadsheet applications differ, and OWASP explicitly records Excel save/re-open caveats.

Current code decision: `packages/web/src/lib/server/csv.ts` owns the deterministic serialization rule; the sessions route imports it instead of carrying a route-local formatter. `csv.test.ts` is the contract safety net. The PR remains non-release-ready until exact-head gates and application-level spreadsheet acceptance are available.

## TRACEABILITY

- Product identity and workflow: `README.md`
- Repository structure and operating rules: `CLAUDE.md`, `AGENTS.md`
- Architectural decisions: `docs/adr.md`, especially ADR-001 and ADR-005/006
- Production export caller: `packages/web/src/app/api/orgs/[orgSlug]/dashboard/sessions/route.ts`
- Serialization boundary: `packages/web/src/lib/server/csv.ts`
- Deterministic regression suite: `packages/web/src/lib/server/csv.test.ts`
- Repair lineage: PR #596, evidence generation `cef6664011f45fc9fa0f1998726d84ee4b04d510`

## Reference

OWASP Foundation. (n.d.). *CSV injection*. OWASP. Retrieved September 8, 2026, from https://owasp.org/www-community/attacks/CSV_Injection
