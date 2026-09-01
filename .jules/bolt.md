## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-01 - Avoid repeated `Date.parse` in sort callbacks
**Learning:** `Date.parse()` called inside `Array.prototype.sort()` results in an O(N log N) number of parsing operations. For larger arrays, this can cause significant blocking on the main thread. Using a Schwartzian transform (map-sort-map) to pre-parse the date strings before sorting turns this into O(N) parsing operations, which provides a measurable performance improvement for features like the session timeline chart.
**Action:** Whenever a sort comparator performs an expensive data transformation (like string parsing), pre-compute the transformed value using a mapping step before sorting.
