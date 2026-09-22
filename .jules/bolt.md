## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-18 - Avoid array allocations in hot paths with `for...in`

**Learning:** When repeatedly iterating over object keys in hot paths (like aggregating large volumes of analytics data), `Object.keys(obj)` creates an intermediate array containing all keys. This array allocation incurs unnecessary garbage collection (GC) overhead and heap thrashing.

**Action:** In high-frequency loops, prefer `for (const key in obj) { if (Object.hasOwn(obj, key)) { ... } }` to avoid array allocations. Always use `Object.hasOwn()` guard to prevent prototype pollution.
