## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-27 - Apply Date.parse to `formatRelativeTime`

**Learning:** `formatRelativeTime` in `format.ts` was previously allocating multiple temporary `Date` objects per invocation. When mapping thousands of events or re-rendering large UI graphs, this caused high memory churn. The `Date.parse()` primitive returns the timestamp integer natively without object allocation.
**Action:** Applied `Date.parse(timestamp) - Date.parse(baseTimestamp)` directly, and also ensured the optimization included appropriate explanatory comments for code longevity and intent sharing. Maintained strictly required styles (e.g. keeping existing string quote and semicolon conventions).
