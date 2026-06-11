## 2024-05-19 - Replace reduce() loops with single for loops for Prisma include relations
**Learning:** Chained `.reduce()` and `.map()` calls on large in-memory arrays (like Prisma `include` results) cause multiple iteration passes and intermediate array allocations. `Object.values()` also allocates an intermediate array, compounding the issue.
**Action:** Use a single `for` loop to accumulate multiple totals simultaneously. When iterating over objects, use `Object.keys()` in a `for` loop instead of `Object.values()` to avoid intermediate array allocation.
