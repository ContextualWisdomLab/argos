## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Use Schwartzian transform for expensive sort comparators

**Learning:** Using `Date.parse(a.timestamp) - Date.parse(b.timestamp)` in a `.sort()` comparator executes O(N log N) `Date.parse` calls, causing unnecessary CPU overhead for larger arrays.

**Action:** For performance-critical arrays (especially those generated inside components or frequent API endpoints), use a Schwartzian transform (decorate-sort-undecorate) to cache the parsed date strings. Doing so shifts the parsing overhead from O(N log N) to O(N).
