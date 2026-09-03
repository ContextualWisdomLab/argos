## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-15 - [O(N log N) Date Parsing Bottleneck in Array Sort]
**Learning:** Parsing dates inside `Array.prototype.sort()` comparators creates a significant O(N log N) performance bottleneck, as dates are re-parsed multiple times per element during the sort operation.
**Action:** Use a Schwartzian transform (mapping the array first to include the parsed value) to pre-parse dates in a single O(N) pass before sorting the dataset.
