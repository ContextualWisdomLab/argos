## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Use for...in for N-sized object iterations in hot paths

**Learning:** `Object.keys()` allocates a new N-sized string array upon every call. In large aggregations processing thousands of nested keys, this creates significant garbage collection overhead and heap thrashing.

**Action:** When iterating over objects with unknown lengths (like dynamic id/name dictionaries) in high-frequency hot paths, prefer `for...in` guarded by `Object.hasOwn()`. This completely bypasses the temporary array allocation.
