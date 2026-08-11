## 2024-08-11 - [Use Date.parse over new Date(string).getTime()]
**Learning:** Using `new Date(string).getTime()` inside loops or frequent computations creates unnecessary Date objects which can degrade V8 performance due to excessive allocations.
**Action:** When parsing ISO strings to timestamps in performance-critical paths, prefer `Date.parse(string)` which returns the timestamp directly without intermediate object allocations.
