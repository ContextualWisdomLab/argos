# Product / Technical Gap Baseline

This baseline is code-current for PR #563 and the CSV export boundary carried by source-bearing head `0c29090be4f73877f41d85c091edda895633a260`. The present documentation-only descendant does not change that source behavior.

## CSV spreadsheet formula injection

**Owner path:** `packages/web/src/lib/server/csv/export.ts` and the session CSV export route.

**Threat.** User-controlled session, project, user, title, or prompt text can cross the CSV boundary and later be interpreted by spreadsheet software. OWASP identifies `=`, `+`, `-`, `@`, tab, carriage return, line feed, and locale-dependent full-width variants as formula-triggering cell prefixes. It also requires separator/quote relocation testing because an attacker can move a dangerous character to the beginning of a different cell. Microsoft Excel can remove quote/escape characters after save and re-open, so apostrophe-based neutralization is not evidence of universal spreadsheet safety.

Primary references:

- OWASP Foundation. (n.d.). *CSV injection*. https://owasp.org/www-community/attacks/CSV_Injection
- OWASP Foundation. (n.d.). *Testing for CSV injection (WSTG-INPV-21)*. OWASP Web Security Testing Guide. https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/21-Testing_for_CSV_Injection

### Current implementation evidence

- Original PR head `ed8e2b932e4be2e72370e3e78362ed2cfcede69a` introduced the shared `csvField` boundary and direct-prefix neutralization.
- RED `e7f705258ceefbaa8add9249f56e8ba78c67e4fe` added cases for formula prefixes hidden behind leading ASCII space, direct control prefixes, line feed, full-width `＝＋－＠`, harmless strings, and raw numbers.
- GREEN `730f24327b723911a239b1b2ba51975f7676e955` preserved the original field value while neutralizing the tested formula/control prefix cases.
- Source-bearing descendant `0c29090be4f73877f41d85c091edda895633a260` refactored the matcher and regression grouping. It still keeps raw numeric values unprefixed, recognizes whitespace preceding `=`, `+`, `-`, `@` and their full-width variants, and separately neutralizes tab/CR/LF when they are the first character. Existing CSV comma/newline quoting and doubled-quote escaping remain in the same shared function.
- The dashboard sessions export maps emitted data fields through `csvField`; numeric token/cost/count values remain raw numbers rather than being converted to formula-neutralized strings.

The `0c29090...` descendant also deleted this baseline while changing the source and tests. That documentation deletion is repaired by the current non-force descendant without reverting the intervening source/test delta.

### Remaining acceptance

The code-level regression contract is implemented, but the commercial security gap is **not closed** until the exact current PR head has terminal CI/security evidence and a representative spreadsheet acceptance exercise verifies exported rows in the spreadsheet clients the product actually supports.

Required GREEN evidence:

1. Exact-head execution of `packages/web/src/lib/server/csv/export.test.ts`, covering direct formula prefixes, leading-whitespace formula prefixes, direct tab/CR/LF, full-width variants, separator/quote relocation, harmless strings, and numeric preservation.
2. Raw CSV inspection proving attacker-controlled separators/quotes cannot relocate an unneutralized trigger to a new cell.
3. Excel and/or LibreOffice acceptance for the supported operator workflow, including save/re-open when exported files are expected to be edited and persisted. Do not generalize one client's behavior to all spreadsheet applications.
4. Terminal SAST, dependency/security, CodeQL, and native CI evidence bound to the same exact head. Queued runs and pre-job `startup_failure` are incomplete evidence, not GREEN.

## Control-plane evidence gap

At source GREEN `730f24327b723911a239b1b2ba51975f7676e955`, CodeQL PR run `33693297350` ended in `startup_failure` before creating any job, while native CI run `33693295841` job `100456641003` remained queued before checkout with no assigned runner. The canonical `.github` control-plane owner has the fleet-level runner/startup-failure lane; leaf source churn must not be used to manufacture a GREEN rerun.
