## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-04 - Avoid Date.parse inside Array.prototype.sort() comparators
**Learning:** Calling `Date.parse()` inside an `Array.prototype.sort()` comparator causes the parsing overhead to be incurred O(N log N) times.
**Action:** Use a Schwartzian transform (Decorate-Sort-Undecorate) to pre-parse the dates in a single O(N) pass via `.map()` before sorting the dataset.
