## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-27 - Lexicographical sorting for ISO 8601 timestamps

**Learning:** ISO 8601 timestamp strings are naturally lexicographically sortable. Using `Date.parse()` repeatedly inside an array's `.sort()` comparator incurs an O(N log N) overhead due to unnecessary string-to-number parsing.
**Action:** When sorting arrays based on ISO 8601 timestamps, use native string comparison (`a < b ? -1 : 1`) instead of parsing the dates. This bypasses the `Date.parse()` overhead while preserving correctness.
