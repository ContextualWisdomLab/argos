## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-14 - [Bolt: Performance Optimization] Reverted for...in optimization

**Learning:** `Object.keys()` is highly optimized in modern V8. While `for...in` combined with `Object.hasOwn()` avoids intermediate array allocations and slightly reduces GC heap size, it can be dramatically slower (e.g. 2x slower in local benchmarks over 10,000 objects with 50 keys) than the built-in `Object.keys()`.
**Action:** Do not blindly replace `Object.keys()` with `for...in` under the assumption that allocation reduction guarantees better performance. Always measure both execution time and heap size in realistic scenarios.
