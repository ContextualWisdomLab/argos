## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-09-13 - [Bolt: Performance Optimization] Use for...in for hot paths

**Learning:** `Object.keys()` and `Object.entries()` allocate a new array on every call, which creates significant garbage collection (GC) overhead when aggregating large object counts in hot loops (e.g. daily rollups or weekly reports).
**Action:** In frequently executed paths that aggregate values across large dictionaries, use a guarded `for...in` loop (`if (Object.hasOwn(obj, key))`) instead to completely bypass intermediate array allocation.
