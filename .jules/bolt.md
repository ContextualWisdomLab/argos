## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - Pre-parse primitives before mapping

**Learning:** `Date.parse()` returns a timestamp primitive and involves ECMAScript string-parsing which has measurable overhead. Calling it repeatedly in a sort comparator or subsequent map loops inside a single execution path scales as O(N log N).

**Action:** Pre-compute the timestamp primitive with a Schwartzian transform (decorate-sort-undecorate) to perform parsing exactly N times (O(N)), keeping the primitive for downstream maps, thus eliminating both redundant object allocation and duplicate parsing.
