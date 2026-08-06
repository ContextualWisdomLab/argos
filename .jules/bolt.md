
## 2025-02-12 - Date Parsing and Chain Iteration Optimizations
**Learning:** In both API routes and client chart components, chaining `.filter()` and `.map()` over large arrays or instantiating `Date` objects inside tight loops or `sort()` comparators results in severe `O(N*M)` or `O(N log N)` allocation bottlenecks and multiple intermediate garbage collections.
**Action:** When filtering/mapping large arrays, use a single `for...of` loop with a `Set` (or push to an array) instead of `.filter().map()` chains. When sorting by dates, implement a Schwartzian transform by pre-parsing the timestamps into primitives (e.g., `.getTime()`) once beforehand.
