## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2023-11-20 - [Avoid Date.parse inside Array.prototype.sort]
**Learning:** Parsing timestamps inside Array.prototype.sort via Date.parse creates an O(N log N) performance bottleneck, as the parse happens every time two items are compared.
**Action:** Use a Schwartzian transform (map to pre-parse the date, sort, and map back) to perform the parsing in a single O(N) pass before sorting. Ensure the pre-parsed value is kept for later use if applicable to avoid redundant parsing.
