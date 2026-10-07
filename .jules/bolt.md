## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-10-07 - Avoid date-fns parseISO for simple primitive extraction
**Learning:** `date-fns` `parseISO` adds significant object allocation and parsing overhead compared to native `Date.parse(isoString)` when only extracting primitive timestamps or simple getter values.
**Action:** Use native `Date.parse()` when converting ISO-8601 strings if the full `date-fns` manipulation capabilities are not strictly required, especially in loops or frequently rendered charts.
