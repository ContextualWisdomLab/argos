## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-26 - React Window Row Memoization
**Learning:** `React.memo` is a performance hypothesis, not a default rule: changing row props, callback identity, shallow-comparison cost, and list size determine whether it reduces or increases work.
**Action:** Keep row memoization only when a fixed large-list React Profiler experiment records render counts, main-thread time, commit duration, sample size, warm-up, failure denominator, median and p95 for selection and scrolling without changing behavior. Remove it when the measured effect is absent or negative.
