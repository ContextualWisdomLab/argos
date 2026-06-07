
## 2024-05-18 - Single Loop Over Prisma Relations
**Learning:** When processing large datasets from Prisma `include` blocks, multiple iteration passes (like chained `.reduce()` calls) over the in-memory relations add unnecessary iteration overhead and can cause performance bottlenecks.
**Action:** Avoid chaining array methods (`.map()`, `.reduce()`, `.filter()`) on large datasets fetched via Prisma. Prefer a single loop (like a `for...of` loop) to calculate multiple derived values simultaneously.
