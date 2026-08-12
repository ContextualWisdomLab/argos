## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Pre-parse timestamps before `.sort()`

**Learning:** Calling `Date.parse()` inline inside a `.sort()` comparator parses the string `O(N log N)` times, causing a measurable performance bottleneck in large datasets.

**Action:** Map the dataset to include the parsed timestamp first (`O(N)` parse time), then sort using the pre-computed numerical primitive.
