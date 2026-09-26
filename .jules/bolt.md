## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-26 - React Window Row Memoization
**Learning:** When using `react-window`, the `Row` component is frequently re-rendered unless wrapped in `React.memo` with `areEqual`. Failing to do so causes list items to needlessly re-render during selection or scrolling, impacting performance for large lists.
**Action:** Always memoize `react-window` item renderers with `memo(Component, areEqual)` and also memoize inner pure components to prevent expensive DOM updates during parent re-renders.
