## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-14 - Optimize Array sort with Schwartzian Transform and retain parsed values
**Learning:** `Date.parse` inside `Array.prototype.sort()` creates an O(N log N) performance bottleneck.
**Action:** Use a Schwartzian transform (decorate-sort-undecorate) to pre-parse dates in a single O(N) pass before sorting. Do not prematurely discard the pre-computed values during the undecorate phase if they are needed later; pass them down the pipeline to eliminate redundant `Date.parse` calls.
