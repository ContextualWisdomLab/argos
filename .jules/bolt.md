## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Schwartzian transform (map-sort-map) for expensive sorting

**Learning:** When sorting large arrays based on an expensive data transformation like `Date.parse()` on ISO strings, placing the transformation inside the `Array.prototype.sort()` comparator causes it to execute O(N log N) times.
**Action:** Use a Schwartzian transform (map-sort-map) to pre-compute the values in O(N) time. To optimize memory during the mapping phase, use a wrapper object (e.g., `{ original: item, parsedValue }`) rather than spreading the original object (`...item`), which avoids O(N) shallow copies.
