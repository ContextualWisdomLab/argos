## 2024-05-24 - [Schwartzian Transform for Fast Array Sorting]
**Learning:** Re-evaluating expensive functions like `Date.parse()` inside an `Array.prototype.sort()` comparator causes O(N log N) redundant calculations.
**Action:** Use the Schwartzian transform (decorate-sort-undecorate) to pre-compute the values in a single O(N) `.map()` pass before sorting. Reuse these computed values later in the pipeline to completely avoid duplicate heavy work.
