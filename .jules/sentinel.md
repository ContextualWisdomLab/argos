## 2026-09-05 - Fix CSV Injection in Session Exports
**Vulnerability:** A CSV Injection (Formula Injection) vulnerability was found in the CSV export functionality for sessions. Fields originating from user input or AI generated content were not sanitized for formula triggers like `=`, `+`, `-`, `@`, `\t`, `\r` when exported to a CSV file.
**Learning:** The `csvField` utility function properly escaped quotes and commas but failed to neutralize characters that trigger formula execution in spreadsheet applications like Microsoft Excel.
**Prevention:** Always sanitize data being exported to CSV by prefixing strings that start with formula trigger characters with a single quote (`'`), being careful to account for leading whitespaces that attackers might use to bypass simpler regex filters.
