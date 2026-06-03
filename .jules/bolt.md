## 2024-06-03 - [Optimize Prisma Relations Iteration]
**Learning:** When processing large datasets from Prisma `include` blocks, chained `.reduce()` or `.map()` calls can introduce unnecessary iteration passes over the same relation data in memory, increasing CPU overhead.
**Action:** Replace multiple chained iterations over the same arrays with a single `for...of` loop to calculate all required aggregates simultaneously.
