## 2025-02-14 - Optimize Array.prototype.reduce in hot path component
**Learning:** In frequently rendered React components (e.g. `TopUsersList`), `Array.prototype.reduce` can introduce noticeable GC overhead, especially when processing many elements.
**Action:** Used a `for` loop wrapped in `useMemo` to perform aggregations (e.g. calculating max tokens), reducing function allocation overhead, and avoiding unnecessary recalculations on re-renders.
