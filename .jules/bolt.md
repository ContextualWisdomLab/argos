## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Use Schwartzian transform for O(N log N) date parsing
**Learning:** `Date.parse(value)` is O(1) but inside `.sort()` it is executed O(N log N) times.
**Action:** When sorting large arrays using string parsing, use a Schwartzian transform (decorate-sort-undecorate) to parse once per item (O(N)) and sort on primitives.
