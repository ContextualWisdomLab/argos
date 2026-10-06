## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Date.parse for ISO-8601 parsing over Date constructor
**Learning:** For ISO-8601 date strings, `Date.parse(isoString)` yields the millisecond timestamp directly without unnecessarily allocating a `Date` object instance, whereas `parseISO` from `date-fns` creates considerable overhead.
**Action:** When extracting a timestamp or basic parts from an ISO-8601 string in a loop or frequently called path, use `Date.parse(isoString)` directly to avoid creating new `Date` objects unless specific complex date operations are needed.
