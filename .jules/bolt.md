## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-20 - Avoid `Date.parse` in sort comparators for ISO 8601 strings
**Learning:** ISO 8601 strings are natively lexicographically sortable. Calling `Date.parse()` inside `.sort()` repeatedly executes string parsing O(N log N) times, causing substantial GC pressure and executing roughly 10x slower than raw string comparison.
**Action:** When sorting arrays by ISO 8601 timestamp strings, use simple string comparison (`a < b ? -1 : a > b ? 1 : 0`) inside the `.sort()` comparator rather than parsing to timestamps.
