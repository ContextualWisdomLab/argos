# Product / Technical Gap Baseline

This baseline is code-current for PR #563 and its current CSV export boundary. It records what is implemented, what has executable regression coverage, and what remains unverified before a commercial security claim is allowed.

## CSV spreadsheet formula injection

**Owner path:** `packages/web/src/lib/server/csv/export.ts` and the session CSV export route.

**Threat:** user-controlled session, project, user, title, or prompt text can cross the CSV boundary and later be interpreted by spreadsheet software. OWASP WSTG-INPV-21 treats `=`, `+`, `-`, `@`, tab, carriage return, line feed, and locale-dependent full-width variants as formula-triggering prefixes and requires testing separator/quote relocation as well as actual spreadsheet import behavior. Primary references:

- OWASP, *CSV Injection*: https://owasp.org/www-community/attacks/CSV_Injection
- OWASP Web Security Testing Guide, WSTG-INPV-21, *Testing for CSV Injection*: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/21-Testing_for_CSV_Injection

### Current implementation evidence

- Original PR head `ed8e2b932e4be2e72370e3e78362ed2cfcede69a` introduced the shared `csvField` boundary and direct-prefix neutralization.
- RED commit `e7f705258ceefbaa8add9249f56e8ba78c67e4fe` adds regression cases for leading ASCII spaces before formula/control prefixes, LF, and full-width `＝＋－＠`, while proving harmless leading spaces and raw numbers retain their representation.
- GREEN commit `730f24327b723911a239b1b2ba51975f7676e955` preserves the original field value while recognizing those hidden prefixes before prepending the text marker. Existing comma/newline quoting and doubled-quote escaping remain in the same shared function.
- The dashboard sessions export maps every emitted data field through `csvField`; numeric token/cost/count values remain raw numbers rather than being converted to formula-neutralized strings.

### Remaining acceptance

The code-level regression contract is implemented, but the commercial security gap is **not closed** until the exact current PR head has terminal CI/security evidence and a right-sized spreadsheet acceptance exercise verifies representative exported rows in the spreadsheet clients the product actually supports. OWASP explicitly warns that quote/apostrophe-based CSV mitigations can behave differently after Microsoft Excel save/re-open, so repository tests alone are not evidence for a universal spreadsheet-safety claim.

Required GREEN evidence:

1. Exact-head unit/CI execution of `packages/web/src/lib/server/csv/export.test.ts` with all direct, whitespace-hidden, LF, full-width, separator, quote, harmless-string, and numeric cases passing.
2. Raw CSV inspection proving attacker-controlled separators/quotes cannot relocate an unneutralized trigger to a new cell.
3. Excel and/or LibreOffice acceptance for the supported operator workflow, including save/re-open if exported files are expected to be edited and persisted.
4. Terminal SAST, dependency/security, and CodeQL evidence bound to the same exact head; queued or pre-job `startup_failure` evidence is incomplete, not GREEN.

## Control-plane evidence gap

At source GREEN `730f24327b723911a239b1b2ba51975f7676e955`, CodeQL PR run `33693297350` ended in `startup_failure` before creating any job, while native CI run `33693295841` job `100456641003` remained queued before checkout with no assigned runner. This has been handed to the canonical `.github` control-plane owner; leaf source churn must not be used to manufacture a rerun.
