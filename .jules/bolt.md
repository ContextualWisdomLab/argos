## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-09-13 - [Optimize Date.parse in array sort]
**Learning:** Parsing dates inside Array.prototype.sort() comparators creates an O(N log N) performance bottleneck due to redundant parsing. Furthermore, when using a Schwartzian transform to optimize the sort, discarding the pre-computed values prematurely leads to duplicated work if subsequent operations (like map) still require them.
**Action:** Pre-parse dates in a single O(N) pass before sorting, and pass the cached values down the pipeline to fully eliminate redundant computations.
