## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Avoid string parsing inside sort comparators

**Learning:** Expensive data transformations like `Date.parse()` inside an `Array.prototype.sort()` comparator execute O(N log N) times.

**Action:** Use a Schwartzian transform (map-sort-map) to pre-compute the transformed values in O(N) time and map them to wrapper objects before sorting.
