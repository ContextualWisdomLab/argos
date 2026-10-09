## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-09 - `Math.max` array spread optimization with `useMemo`

**Learning:** When using `Math.max(...array)` on potentially large arrays within React components, it triggers the spread operator on every render, which can lead to 'Maximum call stack size exceeded' for very large arrays, and recalculates unnecessarily.

**Action:** In React components that render lists or depend on max value calculations from array props, use `.reduce()` instead of the spread operator to prevent call stack issues, and wrap the calculation with `useMemo` to prevent recalculation on every render.
