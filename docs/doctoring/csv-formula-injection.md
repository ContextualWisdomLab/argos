# Session CSV formula-injection boundary

## Threat

Session exports contain text controlled by users or project members, including names, titles, and the first human prompt. Spreadsheet programs may interpret a cell beginning with `=`, `+`, `-`, `@`, tab, carriage return, or line feed as a formula or command-like expression when an administrator opens the CSV.

RFC 4180 defines CSV field delimiting, quote doubling, and CRLF records, but it does not define spreadsheet formula semantics. CSV syntax correctness therefore does not remove formula-injection risk.

## Decision

Argos treats the dashboard CSV endpoint as a human-viewing spreadsheet export profile:

1. Preserve JavaScript `number` values as numeric CSV fields.
2. For string values beginning with a spreadsheet formula marker, prepend a horizontal tab.
3. Quote every neutralized field and double embedded quotation marks according to RFC 4180.
4. Apply normal RFC 4180 quoting to all other strings containing a comma, quotation mark, CR, or LF.
5. Keep the UTF-8 BOM and CRLF record format already used by the endpoint.

This intentionally changes dangerous string values in the exported artifact. The CSV is not a byte-for-byte round-trip interchange format; API and database values remain authoritative. OWASP notes that no single CSV mitigation is universally safe across spreadsheet implementations, so this decision is bounded to the product's human-review export path and is fixed by explicit regression vectors.

## Verification contract

The test suite covers:

- null and undefined values;
- finite numeric values, including negative numbers;
- ordinary strings;
- comma, quote, CRLF, and quote-doubling behavior;
- all supported dangerous leading markers: `=`, `+`, `-`, `@`, tab, CR, and LF;
- the production route importing the shared serializer rather than maintaining a second inline implementation.

## References

OWASP Foundation. (n.d.). *CSV injection*. https://owasp.org/www-community/attacks/CSV_Injection

Shafranovich, Y. (2005). *Common format and MIME type for comma-separated values (CSV) files* (RFC 4180). RFC Editor. https://doi.org/10.17487/RFC4180
