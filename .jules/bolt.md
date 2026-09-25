## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Use Schwartzian transform for expensive sort comparators

**Learning:** When sorting arrays where the comparator requires expensive computation (like `Date.parse()` on strings), `Array.prototype.sort()` can call the computation $O(N \log N)$ times. The Schwartzian transform (decorate-sort-undecorate) avoids this by computing the expensive value once per item.

**Action:** In frequently executed paths or large datasets, use `.map(x => ({ val: x, key: compute(x) })).sort(...).map(x => x.val)` instead of computing within the sort comparator. If subsequent steps (like the `.map()` block in `buildChartData`) also need the computed value, pass the decorated object down the pipeline without prematurely undecorating it to fully eliminate redundant computations.
