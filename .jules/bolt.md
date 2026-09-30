## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-27 - Schwartzian transform for expensive sorts

**Learning:** Lexicographical sorting of ISO 8601 timestamps strings (`a < b ? -1 : 1`) is unsafe unless you can guarantee strictly normalized formats (e.g., matching length and milliseconds presence). A `.100Z` suffix sorts improperly against `Z`. However, executing `Date.parse()` on every comparison inside a `.sort()` comparator results in O(N log N) parse executions, which scales poorly.
**Action:** When sorting arrays based on non-uniform timestamp strings (or other expensive parse operations), use the Schwartzian transform (map-sort-map). Pre-compute the parsed primitives in an O(N) map pass, sort based on the primitive property, and then map back to the original objects.
