## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2023-10-25 - Use `for...in` over `Object.keys()` in hot paths
**Learning:** Using `Object.keys(obj)` creates an array of keys before iterating. In hot paths, like when aggregating large daily rollups, this causes heap thrashing and garbage collection overhead.
**Action:** Use `for...in` loops protected by `Object.hasOwn(obj, key)` for iterating over properties of simple data structures instead of `Object.keys()` to completely avoid array allocations.
