## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-09-14 - Use Schwartzian Transform for timestamp sorting

**Learning:** When sorting arrays based on parsed timestamps, mapping over `Date.parse(value)` within the O(N log N) `.sort()` comparator creates redundant parsing operations and heavy CPU overhead for larger arrays.

**Action:** Pre-parse the timestamps into primitive number values using an initial `.map()` pass (Schwartzian transform) so they are calculated only O(N) times. Retain these parsed values to eliminate redundant re-parsing further downstream if the parsed time is needed again.
