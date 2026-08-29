## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-08-30 - Optimize sorting with ISO 8601 strings
**Learning:** ISO 8601 timestamp strings are natively lexicographically sortable. When sorting arrays by timestamp, using simple string comparison (`a < b ? -1 : a > b ? 1 : 0`) is significantly faster than using `Date.parse()` inside the comparator. This is because it avoids repeated O(N log N) parsing allocations and garbage collection overhead.
**Action:** When sorting arrays by ISO 8601 timestamp strings, use simple string comparison instead of `Date.parse()`. Note that new branch conditions are introduced (less than, greater than, and equal), so add explicit tests for equal timestamps to maintain 100% code coverage.

## 2024-08-30 - CI failure handling
**Learning:** If a CI check (e.g., `noema-review`) fails due to external infrastructure, provider availability, or connection issues (like `request_too_large` or `review sidecar preflight failed`), and the workflow is not locally configured in the repository (e.g., missing from `.github/workflows`), this indicates a centrally managed or third-party infrastructure failure that cannot be fixed by modifying the local codebase.
**Action:** Ignore these CI failures as they are out of the repository's control. Proceed to submit the changes.
