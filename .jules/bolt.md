## 2024-05-14 - Optimize Prisma Include Loops
**Learning:** Chaining multiple `.reduce()` or `.map()` methods on large arrays fetched via Prisma `include` clauses creates unnecessary memory bottlenecks and CPU overhead.
**Action:** Replace multiple chained iteration passes with a single `for...of` loop or traditional `for` loop to minimize iteration overhead over large, deeply nested relation arrays.
