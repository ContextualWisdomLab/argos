## 2024-06-30 - Object.entries in Hot Paths
**Learning:** In V8, `Object.entries(obj)` allocates a new intermediate array `[key, value]` for every key in the object. In heavy aggregation loops like daily rollups, this causes unnecessary garbage collection pressure and memory bloat.
**Action:** Replace `for (const [k, v] of Object.entries(obj))` with `for (const k of Object.keys(obj))` and access `obj[k]` directly when processing high-volume data structures to avoid intermediate allocations.
