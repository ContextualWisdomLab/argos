# Product–technical gap baseline

This document records code-current commercial gaps that must not be promoted from implementation evidence into buyer claims without matching acceptance evidence.

## Session CSV export — spreadsheet formula interpretation

**Status:** Draft repair; release claim not accepted.

### Problem and bounded context

The Dashboard session export serializes user-controlled session/project text into CSV. CSV quoting protects record and field structure, but spreadsheet applications may interpret selected leading characters as formulas when an authorized user opens the file. The owning boundary is the shared server-side `csvField` serializer consumed by the Dashboard session export route. This is an output-serialization invariant, not a repository-wide input-sanitization rule.

The repository-specific impact is not classified as universally HIGH and does not establish workstation command execution. Practical impact depends on the spreadsheet client, configuration, exported content, and user interaction.

### Code-current invariant

`packages/web/src/lib/server/csv.ts::csvField` must:

- preserve `null`/`undefined` as an empty field and typed numbers as numeric text;
- neutralize string fields whose effective leading prefix is `=`, `+`, `-`, `@`, NUL, or a covered full-width equivalent;
- treat tab, CR, and LF consumed as leading whitespace as security-significant rather than erasing them before the dangerous-prefix decision;
- preserve protection when ordinary or Unicode leading whitespace precedes a formula prefix, including vertical-tab/form-feed cases already covered by overlapping predecessor regressions;
- apply CSV delimiter, quote, CR, and LF escaping after formula-prefix neutralization so hostile separators cannot create a second formula-leading cell;
- keep one shared serializer boundary for the session export rather than duplicating route-local policy.

The current repair line contains deterministic test-first evidence for the missing NUL and direct-control-prefix cases and then separates trimmed substantive-prefix detection from security-significant leading controls. Overlapping predecessor lanes contributed valid vertical-tab/form-feed and separator/quote/CRLF regressions; those contracts are inherited here rather than kept as competing implementations. Feature-local generated Sentinel doctrine is not part of this bounded repair.

### Decision

Selected: context-specific CSV serialization with RFC-style structural quoting plus formula-prefix neutralization at the export boundary.

Rejected: treating ordinary CSV quoting alone as formula protection. Spreadsheet formula interpretation is a separate consumer behavior.

Rejected: removing all leading whitespace before the security predicate. Doing so erases tab/CR/LF evidence that the export contract treats as dangerous prefixes.

Rejected: claiming that an apostrophe prefix is universally durable after spreadsheet save/re-open. Supported client workflows require direct validation.

Deferred: switching to a target-specific representation for a particular spreadsheet client. Such a change modifies the exported cell value and must follow an explicit product support contract rather than become a repository-wide default.

### Remaining commercial acceptance gap

Before this gap is marked closed or described as a buyer-visible security guarantee:

1. Run the unchanged final PR head through repository CI, Security Scan, SAST and Required CodeQL; do not transfer predecessor results.
2. Inspect raw CSV for separator/quote/line-break hostile values and prove they remain within one serialized field.
3. Declare the spreadsheet clients/workflows Argos supports for human CSV viewing, then verify benign formula-like fixtures there. Include save/re-open behavior when it is a supported workflow.
4. Obtain qualifying independent current-head review with zero valid unresolved findings.
5. Keep severity and impact scoped to evidence; do not infer command execution from formula interpretation alone.
6. Consume shared dependency remediation only after its canonical owner integrates into protected ancestry, then non-force restack and regenerate exact-head security evidence.

### Traceability and standards

- OWASP Foundation. (2025). *Application Security Verification Standard 5.0.0*, requirement v5.0.0-1.2.10. https://owasp.org/www-project-application-security-verification-standard/
- OWASP Foundation. (n.d.). *CSV Injection*. https://owasp.org/www-community/attacks/CSV_Injection
- OWASP Foundation. (2026). *Web Security Testing Guide: Testing for CSV Injection (WSTG-INPV-21).* https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/21-Testing_for_CSV_Injection

Accessed 2026-09-13.

## Release state

No version, tag, package, SBOM/provenance receipt, reproducibility claim, rollback release, or universal spreadsheet-safety claim is authorized by this Draft repair. Release readiness begins only when one protected exact generation satisfies the repository and organization release gates.
