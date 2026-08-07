# CSV formula-injection boundary

## Decision

Argos treats every string-valued CSV cell as potentially attacker-controlled. Before RFC 4180-style field quoting, `encodeCsvField` prefixes an apostrophe when the first character is a spreadsheet formula trigger: `=`, `+`, `-`, `@`, tab, carriage return, line feed, NUL, or the common full-width variants `＝`, `＋`, `－`, and `＠`.

Numeric application measurements remain numeric, including legitimate negative values. CSV delimiters, embedded quotes, and line breaks are encoded after formula neutralization so attacker-controlled text cannot terminate one field and create a new formula-bearing cell.

The session export route calls this production helper directly. Tests import the same helper rather than reimplementing its logic, so a production regression cannot remain hidden behind a copied test implementation.

## Threat model

The attacker can control text that later appears in an administrator or analyst CSV export, including session titles, user-visible names, project names, and first prompts. The defender assumes the recipient may open the export in Microsoft Excel, LibreOffice Calc, Apple Numbers, or another spreadsheet product that interprets formula-like cells.

The boundary prevents raw exported cells from beginning with the formula-sensitive characters identified by OWASP and CWE-1236 and preserves CSV quoting rules for comma, quote, CR, and LF characters. It does not claim that CSV is a universally safe spreadsheet interchange format: spreadsheet products differ, and Microsoft Excel can alter escaping when a file is saved and reopened. Exports that require stronger spreadsheet semantics should move to a typed spreadsheet format whose cells are explicitly emitted as text.

## Verification contract

Regression tests cover:

- ASCII formula prefixes (`=`, `+`, `-`, `@`);
- tab, CR, LF, and NUL control prefixes;
- common full-width formula-prefix variants;
- a realistic `HYPERLINK` exfiltration payload;
- delimiter and quote injection that attempts to escape into another cell;
- ordinary text and null values; and
- positive and negative numeric measurements, which must remain numeric.

Repository CI remains authoritative for type checking, lint, tests, build, dependency review, SAST, and security scanning on the exact pull-request head.

## Rollback

Rollback requires reverting the route import and `encodeCsvField` helper together. Do not restore the previous copied test helper or the four-character-only prefix matcher. If compatibility pressure requires a different neutralization strategy, first add application-specific spreadsheet tests that reproduce the target import/open workflow and preserve protection against CWE-1236.

## References

MITRE. (2026). *CWE-1236: Improper neutralization of formula elements in a CSV file (4.20).* Common Weakness Enumeration. https://cwe.mitre.org/data/definitions/1236.html

OWASP Foundation. (n.d.). *CSV injection.* https://owasp.org/www-community/attacks/CSV_Injection

OWASP Foundation. (2025). *OWASP Application Security Verification Standard 5.0.0: V1.2 encoding and sanitization.* https://owasp.org/ASVS/

Shafranovich, Y. (2005). *Common format and MIME type for comma-separated values (CSV) files* (RFC 4180). Internet Engineering Task Force. https://doi.org/10.17487/RFC4180
