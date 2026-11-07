## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-11-07 - Avoid repeated Date.parse inside loops/sorts

**Learning:** Calling `Date.parse()` repeatedly on the same strings inside a `.sort()` comparator results in O(N log N) parses for N elements, causing significant performance degradation on large arrays.
**Action:** When sorting an array by a computed property like `Date.parse(value)`, first map the array to include the computed property, then sort the mapped array (Schwartzian transform), or parse it exactly once per element before the sort.
