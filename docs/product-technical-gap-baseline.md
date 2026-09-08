# Product–technical gap baseline

This document records code-current commercial gaps that must not be promoted from implementation evidence into buyer claims without matching acceptance evidence.

## Session CSV export — spreadsheet formula interpretation

**Status:** Draft repair; release claim not accepted.

### Problem and bounded context

The Dashboard session export serializes user-controlled session/project text into CSV. CSV quoting protects the record/cell structure, but spreadsheet applications may interpret selected leading characters as formulas when an authorized user opens the file. The owning boundary is the server-side CSV field serializer used by the Dashboard export route; this is an output-serialization invariant, not a generic input-sanitization rule.

The repository-specific impact is not classified as universally HIGH or as demonstrated workstation code execution. Practical impact depends on the spreadsheet client, its configuration, the exported content, and user interaction.

### Code-current invariant

`packages/web/src/lib/server/csv.ts::csvField` must:

- preserve `null`/`undefined` as an empty field and preserve numeric values as numeric text;
- neutralize formula-trigger prefixes for string values, including `=`, `+`, `-`, `@`, tab and NUL, while preserving the existing CR/LF and full-width trigger handling;
- apply the existing CSV delimiter, quote, CR and LF escaping after formula-prefix neutralization;
- keep one shared serializer boundary for the session export rather than duplicating route-local policy.

The current repair adds the previously missing NUL regression and production predicate. The test-only commit `dbed09cf640d59e8751638cfe6291913db355697` was superseded quickly enough that hosted workflows were cancelled, so it is deterministic checked-in RED intent rather than hosted RED evidence. The causal production fix is `150782ba76045ffea108ab1035562296f489bedd`. Generated repository-wide Sentinel doctrine was then removed in ordinary descendant `0cb5185f18d1e8e3911d977d3d5cecf6423ea76e`; the security contract remains local to the serializer and this baseline.

### Decision

Selected: context-specific CSV serialization with RFC-style quoting plus formula-prefix neutralization at the export boundary.

Rejected: treating ordinary CSV quoting alone as formula protection. Spreadsheet formula interpretation is a different consumer behavior.

Rejected: claiming that an apostrophe prefix is universally safe after spreadsheet save/re-open. OWASP WSTG explicitly requires client/workflow validation because Excel behavior can transform escapes on save/re-open.

Deferred: switching to a tab-prefixed Excel-resistant representation. That changes underlying cell data and must be driven by an explicitly supported spreadsheet-client contract rather than adopted as a repository-wide default.

### Remaining commercial acceptance gap

Before this gap is marked closed or described as a buyer-visible security guarantee:

1. Run the unchanged final PR head through repository CI, Security Scan, SAST and CodeQL; do not transfer predecessor results.
2. Inspect raw CSV for separator/quote hostile values and prove they cannot create a second cell whose first character is a formula trigger.
3. Declare the spreadsheet clients/workflows Argos supports for human CSV viewing, then verify benign formula-like fixtures in those clients. If Microsoft Excel is supported, include save/re-open behavior.
4. Obtain qualifying independent current-head review with zero valid unresolved findings.
5. Keep severity and impact scoped to evidence; do not infer command execution from formula interpretation alone.

### Traceability and standards

- OWASP Foundation. (2025). *Application Security Verification Standard 5.0.0*, requirement v5.0.0-1.2.10. CSV/formula exports must follow CSV escaping rules and neutralize leading formula-trigger characters, including tab and NUL. https://owasp.org/www-project-application-security-verification-standard/
- OWASP Foundation. (2026). *Web Security Testing Guide: Testing for CSV Injection (WSTG-INPV-21).* Client behavior, separator/quote boundaries, and Microsoft Excel save/re-open require workflow-level verification. https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/21-Testing_for_CSV_Injection
- OWASP Foundation. (n.d.). *CSV Injection.* https://owasp.org/www-community/attacks/CSV_Injection

Accessed 2026-09-09.

## Release state

No version, tag, package, SBOM/provenance receipt, reproducibility claim, or rollback release is authorized by this Draft repair. Release readiness begins only after the protected integration generation satisfies the repository and organization release gates on one immutable head.
