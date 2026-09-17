## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-09-17 - Optimize object iteration with for...in

**Learning:** Using `Object.keys()` creates an intermediate array containing all enumerable property names, which causes unnecessary memory allocation and garbage collection overhead, particularly when aggregating large data structures in hot paths like daily rollups.

**Action:** In frequently executed paths that iterate over object keys (like aggregating counts), prefer using `for...in` loops protected by `Object.hasOwn()` instead of `Object.keys()`, `Object.values()`, or `Object.entries()`. This completely avoids array allocations and significantly reduces heap thrashing.
