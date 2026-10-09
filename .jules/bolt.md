## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-10-09 - Native Date.parse vs date-fns parseISO
**Learning:** For simple extraction of timestamp primitives (like days of the week) from standard ISO-8601 strings, `Date.parse(isoString)` is significantly faster than `date-fns`'s `parseISO` because it avoids object allocation and comprehensive validation overhead, which becomes critical inside rendering loops or large map functions.
**Action:** When extracting simple time data from trusted ISO string formats, use native `Date.parse` to minimize execution time and memory allocations in frequent render paths.
