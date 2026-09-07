## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-09-07 - [Hot Path Optimization: `for...in` vs `Object.keys()`]
**Learning:** `Object.keys()`는 호출될 때마다 새로운 배열을 할당하기 때문에 반복이 많은 hot path(예: 대규모 데이터 집계 루프)에서는 GC(Garbage Collection) 오버헤드를 크게 유발할 수 있습니다.
**Action:** 극단적인 성능 최적화가 필요한 경우, `Object.keys()` 대신 `Object.hasOwn()`으로 보호된 `for...in` 루프를 사용하여 배열 할당을 완전히 피하도록 합니다.
