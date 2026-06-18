## 2024-05-30 - Array reduce inside Object.values creates multiple intermediate arrays
**Learning:** Chaining `.reduce` inside `Object.values().reduce` creates intermediate arrays and forces multiple full passes over the dataset.
**Action:** Use a single `for...of` loop and iterate over `Object.keys()` directly for inner objects to avoid array allocations and multiple passes.
