## 2025-06-13 - [Performance] Single-pass Iteration for Usage Records
**Learning:** Multiple iterations via `.reduce()` on usage records add unnecessary overhead.
**Action:** Always prefer a single `for...of` loop when calculating multiple sums from an array.
