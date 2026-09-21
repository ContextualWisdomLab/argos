## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Use `for...in` instead of `Object.keys()` for extreme hot paths

**Learning:** When aggregating large data structures or iterating through object keys frequently, `Object.keys()` (and `Object.entries()`, `Object.values()`) allocate new arrays, which increases GC (Garbage Collection) pressure and heap thrashing. `for...in` loop entirely avoids these allocations.
**Action:** In highly critical hot paths involving data aggregation, prefer using `for...in` loop guarded by `if (Object.hasOwn(obj, key))` over `Object.keys()` to prevent GC overhead and array allocations.
