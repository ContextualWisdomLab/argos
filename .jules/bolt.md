## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2023-10-25 - Use for...in loops for high-frequency object iterations

**Learning:** While `Object.keys()` iterations are better than `Object.entries()` as they avoid allocating tuples for every key-value pair, `Object.keys()` still allocates a string array for the keys. In hot paths that aggregate massive amounts of objects (e.g. daily rollups for user skills and agents), a `for...in` loop with an `Object.hasOwn()` check eliminates array allocations completely, drastically lowering GC overhead during execution.

**Action:** In critical aggregation loops iterating over dictionaries, use `for...in` loops guarded by `Object.hasOwn(obj, k)` instead of `Object.keys()` to completely bypass array allocations.
