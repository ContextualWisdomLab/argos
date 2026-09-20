## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-24 - Optimize O(N log N) Date.parse in sort

**Learning:** When sorting large arrays of ISO strings, calling `Date.parse()` inside the comparator executes O(N log N) times. A Schwartzian transform (map-sort-map) reduces this to O(N) string parsing overhead, significantly improving sort speed for rendering.

**Action:** When sorting timestamps on the frontend, pre-compute the parsed primitives in an intermediate mapped array rather than embedding the `Date.parse()` call inline within the `.sort()` comparator.
