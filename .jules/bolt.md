## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-09-06 - [Date.parse in Sort Comparator]
**Learning:** Parsing ISO strings with `Date.parse` inside an `Array.prototype.sort()` comparator is an O(N log N) performance bottleneck, especially on large arrays. Moreover, recalculating `Date.parse` in subsequent maps on the same array wastes CPU cycles.
**Action:** Use a Schwartzian transform (map-sort-map) to parse timestamps once in O(N) time. Use wrapper objects `{ original, parsedValue }` to preserve memory rather than spreading the original object.
