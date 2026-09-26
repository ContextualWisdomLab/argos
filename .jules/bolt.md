## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-16 - Schwartzian Transform for expensive parsing during Array.prototype.sort()

**Learning:** `Array.prototype.sort()` calls its comparator function O(N log N) times. If an expensive transformation like `Date.parse(ISO_STRING)` is inside the comparator, it executes redundantly. Spreading an object in `map` (`...item`) creates O(N) shallow copies, whereas wrapping the original reference in an object (`{ original: item }`) avoids the shallow copy allocation.
**Action:** Use a Schwartzian transform (map-sort-map) to pre-compute sort keys in O(N) time for large datasets. To minimize memory usage in the mapping phase, wrap the item reference (`{ original: item, key }`) rather than cloning the original object properties.
