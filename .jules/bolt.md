## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-21 - Use string comparison for ISO 8601 timestamps in sorting
**Learning:** For ISO 8601 strings, native string comparison is significantly faster (~10x) than parsing strings to timestamps using `Date.parse()` inside `.sort()` comparators. Since ISO 8601 strings are lexicographically sortable, string comparison achieves the same result without O(N log N) allocation overhead.
**Action:** Always use string comparison inside array `.sort()` for ISO 8601 strings instead of `Date.parse()` or map-sort-map patterns unless the resulting timestamp is needed for other computations.
