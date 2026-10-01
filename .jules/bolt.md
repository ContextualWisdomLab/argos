## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Use Schwartzian transform for sorting dates
**Learning:** `Date.parse()` called inside a `.sort()` comparator results in $O(N \log N)$ executions of the parsing string operation, which can severely slow down hot-paths when arrays are large.
**Action:** When sorting using an expensive transformation (e.g., date parsing), apply the Schwartzian transform (map-sort-map) to only execute the transformation $O(N)$ times. Note that strictly lexicographical sorting of perfectly normalized strings doesn't require this, but if the strings must be parsed, always map them out first.
