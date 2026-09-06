## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Use Schwartzian transform for O(N log N) sorting bottlenecks

**Learning:** Parsing dates inside `Array.prototype.sort()` creates an O(N log N) performance bottleneck due to repeated execution of the parsing logic.
**Action:** Use a Schwartzian transform (map-sort-map) to pre-parse values in a single O(N) pass before sorting.
