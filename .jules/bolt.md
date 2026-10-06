## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-10-06 - Schwartzian transform optimization for sorting

**Learning:** When applying the Schwartzian transform (map-sort-map) to avoid expensive operations like `Date.parse()` in a `.sort()` comparator, if the pre-computed value is needed in subsequent operations, you can omit the final 'undecorate' step (using a map-sort pattern). This allows you to reuse the cached value and prevents redundant calculations, maximizing performance gains.

**Action:** Look for opportunities to reuse pre-computed sort keys in down-stream processing when applying the map-sort-map pattern.
