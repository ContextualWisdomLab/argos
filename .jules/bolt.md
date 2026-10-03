## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Schwartzian transform for expensive sort comparators
**Learning:** Sorting arrays where the comparator invokes expensive functions like `Date.parse()` on strings results in O(N log N) executions of those functions. Using a Schwartzian transform (map-sort-map pattern) extracts the expensive logic, converting O(N log N) overhead into a linear O(N) cost upfront.
**Action:** When a sort comparator computes derived properties (like parsing strings to integers), pre-compute those values using `.map()` to attach the primitive to a wrapper object, sort the wrappers, and map back to the desired output.
