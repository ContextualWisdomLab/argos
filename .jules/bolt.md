## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2023-10-12 - [Array Iteration Optimization in Session Export]
**Learning:** Chained `.map(...).filter(...)` operations on large arrays allocate an intermediate array which creates GC overhead. This is problematic on hot paths like dashboard data endpoints.
**Action:** Replace `.map().filter()` chains with a single `.reduce()` pass for array aggregations to minimize allocations and GC pause times.
