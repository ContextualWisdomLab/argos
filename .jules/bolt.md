## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Use map-sort-map (Schwartzian transform) for slow comparators
**Learning:** `Date.parse()` called inside `Array.prototype.sort()` results in redundant string parsing because the comparator is executed `O(n log n)` times.
**Action:** Transform arrays to precompute the parsed values into primitives first (using `.map()`), sort those primitives, then use the precomputed values. This transforms `O(N log N)` parsing overhead into `O(N)`.
