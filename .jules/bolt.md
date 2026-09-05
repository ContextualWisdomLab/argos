## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-04 - Avoid Expensive Operations in Sort Comparators
**Learning:** Operations like `Date.parse()` execute `O(N log N)` times when placed directly inside `Array.prototype.sort()` comparators. This creates a severe performance bottleneck when sorting large datasets like timelines.
**Action:** Use a Schwartzian transform (map-sort-map) to pre-compute the transformed values in O(N) time before sorting, passing a wrapper object `{ original, parsedValue }` to preserve memory efficiency.
