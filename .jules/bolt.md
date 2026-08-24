## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-24 - Use native string comparison for ISO 8601 sorting

**Learning:** When sorting arrays by ISO 8601 timestamp strings, using simple string comparison inside the `.sort()` comparator (`a < b ? -1 : a > b ? 1 : 0`) is significantly faster than using `Date.parse()`. ISO 8601 strings are lexicographically sortable natively.
**Action:** Use native string comparison for ISO 8601 sorting instead of `Date.parse()` to avoid repeated O(N log N) parsing allocations.
