## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2023-10-25 - Object.entries vs for...in
**Learning:** Using `Object.entries(map).map()` to sort and process maps creates many intermediate short-lived array tuple objects, which triggers heavy garbage collection overhead in hot backend aggregation paths.
**Action:** Use a standard `for...in` loop to iterate over objects, initializing arrays explicitly when array output is needed, completely avoiding intermediate array allocation in aggregation paths.
