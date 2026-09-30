## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Optimize Array sort with Schwartzian Transform

**Learning:** Array sorting comparators execute O(N log N) times. Placing expensive operations like `Date.parse` inside the comparator degrades performance for large arrays.
**Action:** Use a Schwartzian transform (map-sort-map) to precompute the sort keys and use a wrapper object `{ original: item, computedKey }` to avoid memory overhead of spreading large objects.
