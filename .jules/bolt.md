## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Use native string comparison for ISO timestamps

**Learning:** When sorting arrays of objects by ISO-8601 timestamps (e.g., `2023-01-01T00:00:00.000Z`), using native Javascript string comparison (`a.timestamp < b.timestamp`) is significantly faster and allocates less memory than parsing the string into a numeric timestamp primitive with `Date.parse()` and performing numerical subtraction (`Date.parse(a.timestamp) - Date.parse(b.timestamp)`).

**Action:** If a `Date.parse` parsing bottleneck exists inside a `.sort` loop, DO NOT replace it with a Schwartzian transform if simple native string comparison can be used instead. The native string comparison is more readable, prevents memory allocations, and is extremely fast. Only apply the Schwartzian transform when the parsed primitive is strictly required or standard string sorting is insufficient.
