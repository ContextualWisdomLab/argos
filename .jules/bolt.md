## 2024-07-24 - Array allocation in Map initialization
**Learning:** Found multiple instances where `new Map(array.map(...))` is used. `array.map` allocates a new array in memory, which is then immediately consumed by `Map` constructor and discarded. This creates unnecessary GC pressure, especially for large lists or frequently executed paths.
**Action:** Replace `new Map(array.map(...))` with a simple `for` loop that calls `map.set()` directly. This turns O(N) allocations into O(1) + Map resizing overhead.

## 2024-07-24 - Nested O(N*M) array iteration in chart rendering
**Learning:** Found an $O(N \times M)$ nested loop pattern in `session-timeline-chart.tsx` where `.filter` and `.map` were being called inside another `.map` across two chronologically sorted arrays (timeline buckets and tool calls). This caused unnecessary re-evaluations and `new Date()` parsing on every render cycle.
**Action:** Use an $O(N + M)$ two-pointer approach when aggregating or grouping data from two pre-sorted arrays. Keep `Date` parsing out of inner loops and use pre-computed arrays to reduce overhead.
