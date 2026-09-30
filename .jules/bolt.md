## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-10-01 - Date.parse inside Array.prototype.sort
**Learning:** Using `Date.parse()` directly within the callback of `Array.prototype.sort()` causes redundant parsing operations (O(N log N) evaluations), which becomes a significant CPU bottleneck on large arrays (like dashboard event lists or usage data).
**Action:** Parse the timestamps once in a separate `map()` pass (O(N)) to attach the numeric timestamps to the objects before sorting them, commonly known as a Schwartzian transform.
