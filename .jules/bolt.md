## 2024-08-10 - Date Parsing Optimization
**Learning:** Using `new Date(string).getTime()` inside loops or sort callbacks causes unnecessary object allocations and slows down parsing in V8.
**Action:** Always prefer `Date.parse(string)` when parsing ISO strings to timestamps, especially in performance-critical paths like charts and list rendering.
