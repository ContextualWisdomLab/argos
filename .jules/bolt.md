## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-09-22 - Schwartzian transform in Array#sort
**Learning:** Parsing dates inside sort comparators is O(N log N) which degrades performance for large datasets.
**Action:** Pre-parse in O(N) using Schwartzian transform (decorate-sort-undecorate) and retain the cached values down the pipeline to eliminate redundant computations.
