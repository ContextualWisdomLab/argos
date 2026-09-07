## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-09-07 - Use `for...in` over `Object.keys()` in hot paths

**Learning:** `Object.keys()` allocates a new array on every call, causing unnecessary heap thrashing and garbage collection (GC) overhead when aggregating large daily rollups or iterating frequently.

**Action:** 핫 패스(hot paths)에서 객체의 속성을 순회할 때는 `Object.keys()` 대신 `for...in` 루프와 `Object.hasOwn()` 검사를 결합하여 사용하여 배열 할당과 GC 오버헤드를 방지하십시오.
