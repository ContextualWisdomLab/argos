## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-10-02 - Array sort micro-optimization

**Learning:** When sorting large arrays using an expensive operation like `Date.parse()`, avoid O(N log N) executions inside the `.sort()` comparator by utilizing the Schwartzian transform (map-sort-map pattern).

**Action:** Pre-compute the values in O(N) time and map them into a wrapper object to ensure optimal performance when a simple lexicographical string comparison is insufficient.
