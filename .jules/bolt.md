## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-27 - Pre-parse dates before sorting
**Learning:** Parsing dates inside `Array.prototype.sort()` comparators creates an O(N log N) performance bottleneck.
**Action:** Pre-parse dates in a single O(N) pass (e.g. using a Schwartzian transform) before sorting the dataset to avoid this overhead.
