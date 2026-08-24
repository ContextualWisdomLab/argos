## 2026-08-11 - Use `Date.parse` for timestamp primitives
**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.
**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Prevent O(N log N) Date.parse execution in sort comparator (Schwartzian transform)
**Learning:** Performing a string parsing operation like `Date.parse()` directly inside the `Array.prototype.sort()` comparator causes the parser to be invoked repeatedly for every comparison, running O(N log N) times rather than O(N).
**Action:** When sorting arrays of objects containing string dates, use a Schwartzian transform pattern by mapping the elements into a structure that holds both the original object and the pre-computed primitive (e.g. `parsedTs: Date.parse(usage.timestamp)`), sorting by the primitive, and mapping back.
