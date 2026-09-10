## 2024-10-24 - Avoid parsing dates inside Array.prototype.sort() comparators
**Learning:** `Date.parse()` inside an `Array.prototype.sort()` comparator causes O(N log N) performance bottlenecks by redundantly parsing the same timestamp strings multiple times.
**Action:** Apply a Schwartzian transform (decorate-sort-undecorate) to pre-parse the dates in a single O(N) pass before sorting. Reuse the pre-parsed timestamps in subsequent operations to fully eliminate redundant computations.
