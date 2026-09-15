## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-15 - Schwartzian Transform for Date Sorting
**Learning:** `Date.parse()` inside an array sort comparator causes O(N log N) redundant string parsing overhead.
**Action:** Use a Schwartzian transform to pre-parse dates in a single O(N) pass, and retain the parsed values for subsequent pipeline stages to fully eliminate redundant computations.
