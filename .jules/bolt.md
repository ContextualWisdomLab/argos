## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-24 - Avoid `Date.parse` in sort comparators for ISO strings
**Learning:** Parsing ISO strings to primitives using `Date.parse` repeatedly inside array `.sort` comparators causes significant performance degradation due to redundant O(N log N) evaluations.
**Action:** Since ISO 8601 strings are naturally sortable as strings, use simple string comparison (`a < b ? -1 : a > b ? 1 : 0`) instead of parsing when sorting by date.
