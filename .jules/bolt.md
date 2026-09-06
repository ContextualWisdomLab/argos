## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-06 - Schwartzian transform for expensive sort comparators

**Learning:** When sorting large arrays based on an expensive data transformation like `Date.parse()` on ISO strings, placing the transformation directly inside the `Array.prototype.sort()` comparator causes it to execute O(N log N) times. A Schwartzian transform (map-sort-map) pre-computes the values in O(N) time.

**Action:** Wrap items in an object `{ original: item, parsedValue: expensiveOperation(item) }` prior to sorting when the comparator relies on computationally non-trivial operations.
