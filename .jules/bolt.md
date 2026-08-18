## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-18 - String comparison for sorting ISO 8601 timestamps

**Learning:** When sorting arrays by ISO 8601 timestamp strings, using simple string comparison (`a < b ? -1 : a > b ? 1 : 0`) is significantly faster than using `Date.parse(a) - Date.parse(b)`. The native string comparison avoids the O(N log N) allocations and parse overhead while maintaining the correct lexicographical sort order.

**Action:** When sorting arrays of objects that have ISO 8601 timestamp strings, use simple string comparison instead of `Date.parse()` inside the `.sort()` comparator.
