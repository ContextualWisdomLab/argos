## 2026-06-05 - Avoid multiple iteration passes on Prisma include arrays
**Learning:** When aggregating metrics from large Prisma relational arrays (`include`), chaining multiple `.reduce()` calls or performing multiple passes causes high iteration overhead and potential memory bottlenecks.
**Action:** Always prefer a single `for...of` loop or a single accumulator pass when calculating multiple summary metrics (like token counts and costs) over the same relation dataset.
