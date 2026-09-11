## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-24 - [Schwartzian Transform for Fast Array Sorting]
**Learning:** Re-evaluating expensive functions like `Date.parse()` inside an `Array.prototype.sort()` comparator causes O(N log N) redundant calculations.
**Action:** Use the Schwartzian transform (decorate-sort-undecorate) to pre-compute the values in a single O(N) `.map()` pass before sorting. Reuse these computed values later in the pipeline to completely avoid duplicate heavy work.
