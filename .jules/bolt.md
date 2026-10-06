## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-14 - Memoize expensive operations inside React components

**Learning:** Expensive calculations (such as Array.reduce across props) executed directly in component bodies will recalculate on every render cycle, degrading rendering performance.

**Action:** In React components that render lists or process arrays, wrap expensive synchronous data derivations with `useMemo`.
