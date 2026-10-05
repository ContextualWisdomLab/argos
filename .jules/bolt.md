## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-05 - Optimize expensive string parsing inside sorting comparators
**Learning:** Calling functions like `Date.parse()` inside an `Array.prototype.sort()` comparator forces JavaScript engines to execute the operation O(N log N) times.
**Action:** When sorting data that requires expensive pre-processing, use the Schwartzian transform (map-sort-map) to compute the parsed values exactly once per item (O(N)), avoiding redundant overhead.
