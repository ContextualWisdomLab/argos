## 2024-06-25 - Single loop for Prisma relations
**Learning:** When processing large datasets from Prisma `include` blocks, avoid multiple iteration passes (like chained `.reduce()` or `.map()` calls) over the in-memory relations.
**Action:** Prefer a single loop to minimize iteration overhead and reduce potential memory bottlenecks.
