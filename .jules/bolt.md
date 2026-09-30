## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - Anti-optimization with Schwartzian transform on perfectly normalized ISO 8601 strings

**Learning:** Lexicographical sorting of perfectly normalized ISO 8601 timestamp strings (matching length and milliseconds) is highly optimized. Adding `Date.parse()` via a Schwartzian transform to such strings is an anti-optimization that creates unnecessary memory allocation and parsing overhead.

**Action:** Only use the Schwartzian transform (map-sort-map) to refactor code where expensive operations like `Date.parse()` are *already* inefficiently called inside the `.sort()` comparator. Do not blindly apply it to replace direct string comparisons of normalized timestamps.
