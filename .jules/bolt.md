## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-24 - Object.keys() vs for...in Performance in Hot Paths
**Learning:** While `Object.keys()` avoids some overhead compared to `Object.entries()`, it still allocates a new array of strings every time it is called. In extreme hot paths (like aggregating thousands of daily rollups), this creates significant garbage collection (GC) pressure.
**Action:** Use a `for...in` loop with `Object.hasOwn(obj, key)` in extreme hot paths to iterate over object properties without any array allocation, minimizing heap thrashing and GC pauses.
