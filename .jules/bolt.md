## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2025-02-13 - Native Date Parsing over date-fns
**Learning:** Using native `Date.parse(isoDate)` provides equivalent functionality for standard ISO-8601 strings compared to `parseISO` from `date-fns`, but avoids unnecessary object allocation and overhead, making it significantly faster for frequent render paths.
**Action:** Extract timestamp primitives using `Date.parse` over `parseISO` whenever possible to optimize loops or chart rendering logic.
