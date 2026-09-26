## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-05-14 - Use Schwartzian transform for expensive sort accessors

**Learning:** When sorting an array based on derived properties that require expensive computation (like \`Date.parse(timestamp)\`), calling the computation directly within the \`sort\` comparator results in O(N log N) redundant executions. Decorating the array beforehand reduces the computation to O(N).

**Action:** Apply the Schwartzian transform (decorate-sort-undecorate) to arrays sorted by expensive accessors. If the decorated property is needed later, retain it in the final object instead of undecorating completely to save even more cycles.
