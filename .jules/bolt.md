## 2024-05-24 - Optimize Prisma nested include iterations
**Learning:** When calculating totals or metrics from large nested datasets (e.g., from Prisma `include` results), using multiple chained `.reduce()` calls causes multiple iterations over the same data, leading to unnecessary memory allocation and iteration overhead.
**Action:** Replace multiple chained array iteration methods (like `.reduce()`, `.map()`, or `.filter()`) with a single `for...of` loop when aggregating multiple metrics from the same dataset to minimize iteration overhead.
