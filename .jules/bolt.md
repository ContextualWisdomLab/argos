## 2024-08-08 - Use Date.parse() instead of new Date().getTime() for ISO strings
**Learning:** In performance-critical paths (e.g. iterating over arrays in formatters or charting components), `new Date(iso).getTime()` causes unnecessary object allocations, slowing down performance.
**Action:** Use `Date.parse(iso)` directly to avoid allocations when simply extracting a timestamp in milliseconds.