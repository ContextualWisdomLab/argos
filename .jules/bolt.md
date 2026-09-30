## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2025-03-09 - [Schwartzian Transform Date.parse in Chart rendering]
**Learning:** Avoid repeatedly calling `Date.parse()` inside array `sort` comparators, as it results in O(N log N) parsing overhead which can be a performance bottleneck during frontend visualization of large datasets.
**Action:** Use a Schwartzian transform (decorate-sort-undecorate) to parse the timestamp strings just once per item (O(N)), sort the decorated objects by the pre-computed parsed timestamp, and then optionally reuse those computed timestamps in downstream pipeline operations instead of parsing them again.
