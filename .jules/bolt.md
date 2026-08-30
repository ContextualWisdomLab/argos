## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-08-30 - Date.parse in Sort Comparators
**Learning:** Parsing dates inside `Array.prototype.sort()` comparators (like `Date.parse(a) - Date.parse(b)`) creates an O(N log N) performance bottleneck by redundantly parsing the same dates multiple times.
**Action:** Always pre-parse dates in a single O(N) pass before sorting arrays, such as using a Schwartzian transform (e.g., `.map()` to add the parsed timestamp before sorting).
