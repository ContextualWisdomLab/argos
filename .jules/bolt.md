## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Use Schwartzian Transform for expensive sorting

**Learning:** Array sorting comparators involving expensive string computations (e.g., `Date.parse()`) execute O(N log N) times, causing CPU overhead.
**Action:** Use a map-sort-map pattern (Schwartzian transform) to precompute the parsed values into primitives first (O(N)), sort the primitives, and then unmap.
