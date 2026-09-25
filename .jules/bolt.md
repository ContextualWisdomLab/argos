## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2025-03-01 - Schwartzian transform optimization for O(N log N) loops
**Learning:** During Schwartzian transforms of timelines to reduce re-parsing of dates in O(N log N) loops to O(N), one must pass the cached values down the pipeline to fully eliminate redundant computations (e.g., repeated `Date.parse()` calls).
**Action:** Pre-parse the dates in a single O(N) pass using `.map()` for a Schwartzian transform before sorting the dataset and do not prematurely discard the pre-computed values during the 'undecorate' phase if subsequent operations still require them.
## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2025-03-01 - Schwartzian transform optimization for O(N log N) loops
**Learning:** During Schwartzian transforms of timelines to reduce re-parsing of dates in O(N log N) loops to O(N), one must pass the cached values down the pipeline to fully eliminate redundant computations (e.g., repeated `Date.parse()` calls).
**Action:** Pre-parse the dates in a single O(N) pass using `.map()` for a Schwartzian transform before sorting the dataset and do not prematurely discard the pre-computed values during the 'undecorate' phase if subsequent operations still require them.
