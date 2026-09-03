# Session CSV formula-injection boundary

## Decision

Argos treats session CSV export as a security boundary because exported session titles, user/project labels, and prompts can contain attacker-controlled text that a spreadsheet application may reinterpret as a formula.

`packages/web/src/lib/server/csv/export.ts` therefore applies two separate controls:

1. **CSV structure:** fields containing commas, quotes, carriage returns, or line feeds are quoted and embedded double quotes are doubled, matching the field escaping rules described by RFC 4180 sections 2.6 and 2.7.
2. **Spreadsheet semantics:** string fields whose first code point is a known formula initiator are prefixed with a single quote before CSV structural quoting. The guarded set is `=`, `+`, `-`, `@`, tab, carriage return, line feed, NUL, and the full-width variants `＝`, `＋`, `－`, `＠`. Actual JavaScript `number` values remain numeric so token counts, event counts, and cost values keep number semantics.

The extra line-feed and full-width cases follow the current OWASP CSV Injection guidance; NUL follows OWASP ASVS v5.0.0 requirement 1.2.10. Tests cover all of these prefixes and verify that the ordinary RFC 4180 quoting behavior remains intact.

## Buyer-visible behavior

The CSV download remains structurally compatible with common spreadsheet tools. Dangerous string values are intentionally visible with a leading single quote rather than being silently deleted or rewritten. This preserves an auditable representation of the source value while preventing the exported first character from being the original formula initiator under the ASVS 5.0.0 contract.

This is a server-side export-format boundary, not a custom visual component. No Figma or Storybook surface is introduced by this repair; the executable CSV serializer and its tests are the authoritative product contract.

## Important interoperability limit

There is no universal CSV sanitization strategy that is safe for every spreadsheet application and every downstream consumer. OWASP's current CSV Injection page notes that Microsoft Excel can remove quotes or escape characters when a CSV is saved and reopened, and describes a tab-inside-quoted-field variant for `=`, `+`, `-`, and `@` as more resistant in Excel at the cost of changing the underlying data.

Argos deliberately follows the OWASP ASVS v5.0.0 single-quote requirement for this machine-readable session export and records the limitation instead of claiming universal spreadsheet safety. A future change to an Excel-specific tab-prefix mode should be an explicit export-profile decision with regression coverage because it changes round-trip data semantics.

## Test-first traceability

- predecessor implementation: `ee7ffc7858688ca6b3e5b982e8981664a2ebd75b`
- RED coverage extension: `dd30bda3d930ba3e4457ca77ee5c16e0fedfd07e`
- GREEN prefix contract and public docstring: `7ae904d58c339c009cf85c988ba46846700527a1`
- unrelated dependency/lock drift removed: `fa6c4ab8dbd913d56c4ba60b26d1b2a0e5d62acf`
- canonical PR: `ContextualWisdomLab/argos#518`

The RED extension adds line-feed, NUL, and full-width formula initiators that the predecessor regex did not neutralize. The GREEN implementation centralizes the guarded set rather than scattering per-call-site checks.

## Rollback rule

Do not roll back to a serializer that checks only `=`, `+`, `-`, `@`, tab, and carriage return. A safe rollback may choose a stricter export mode, but it must preserve RFC 4180 structural escaping and a reviewed formula-injection defense for every then-current OWASP/ASVS initiator.

## References

OWASP Foundation. (2025). *Application Security Verification Standard 5.0.0* (Requirement v5.0.0-1.2.10). https://owasp.org/www-project-application-security-verification-standard/

OWASP Foundation. (n.d.). *CSV injection*. Retrieved August 28, 2026, from https://owasp.org/www-community/attacks/CSV_Injection

Shafranovich, Y. (2005). *Common format and MIME type for comma-separated values (CSV) files* (RFC 4180). RFC Editor. https://www.rfc-editor.org/rfc/rfc4180
