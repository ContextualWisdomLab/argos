## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-27 - Lexicographical sorting for ISO 8601 timestamps
**Learning:** ISO 8601 strings are lexicographically sortable natively, meaning simple string comparison (`a < b ? -1 : a > b ? 1 : 0`) can be used inside `.sort()` comparators instead of repeatedly calling `Date.parse()`.
**Action:** When sorting arrays by ISO 8601 timestamp strings, use simple string comparison to avoid repeated `O(N log N)` parsing allocations, resulting in significantly faster sorting.
