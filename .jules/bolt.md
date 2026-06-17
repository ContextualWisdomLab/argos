## 2024-06-17 - Array Allocation Overhead in Reduce Chains
**Learning:** Chaining `.reduce()` with `Object.values()` creates temporary intermediate arrays and causes multiple passes over the dataset. In V8, these short-lived allocations can trigger frequent garbage collection, especially when looping over many elements (like daily rollups).
**Action:** When aggregating totals from nested objects, consolidate iterations into a single `for...of` loop and use `Object.keys()` to access values, which avoids the intermediate array allocations of `Object.values()`.
