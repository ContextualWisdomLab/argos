## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2023-10-27 - [for...in 객체 순회 최적화]
**Learning:** Object.keys()는 반복마다 배열을 생성하여 대량 데이터 집계(hot path) 시 가비지 컬렉션 부하를 야기함.
**Action:** 대규모 데이터 집계(daily-rollup, weekly-report) 핫 패스에서는 `Object.keys()` 대신 `for...in`과 `Object.hasOwn()`을 결합하여 배열 할당 및 GC 오버헤드를 원천 차단할 것.
