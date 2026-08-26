## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-26 - Use string comparison for ISO 8601 sorting

**Learning:** ISO 8601 strings are lexicographically sortable natively. Using string comparison (`a < b ? -1 : a > b ? 1 : 0`) inside `.sort()` comparators instead of parsing timestamps with `Date.parse()` or `new Date()` makes sorting significantly faster by avoiding repeated O(N log N) parsing allocations.
**Action:** When sorting arrays of objects by an ISO 8601 timestamp string, use conditional string comparison rather than `Date.parse()`.
