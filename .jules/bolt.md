## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-09-29 - Cache object methods in frequently executed loops
**Learning:** Method calls on objects like `Date.getTime()` within inner loops introduce significant overhead when called repeatedly. Extracting these into a pre-computed typed array like `Float64Array` significantly reduces allocation and dispatch overhead.
**Action:** In loops iterating over many items (e.g. usage records and messages), cache method call results into primitive arrays outside the loop before comparing.
