## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-08 - Use Schwartzian transform for sorting dates
**Learning:** Sorting arrays using `Date.parse` inside the comparator results in redundant parsing (O(N log N) executions). This can be a bottleneck.
**Action:** Use a Schwartzian transform (map-sort-map) to parse timestamps once (O(N)), sort by the primitive value, and map back to the original objects. Avoid spreading original items in map to reduce shallow copy overhead.
