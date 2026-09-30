## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-08-11 - 최적화 핫 패스에서 배열 할당 제거 (`for...in` vs `Object.keys()`)

**Learning:** `Object.keys(obj)`와 같은 배열 생성 메서드는 빈번하게 호출되는 루프 내에서 가비지 컬렉션(GC) 부하를 유발합니다. 객체의 프로퍼티 순회 시 `for...in` 루프를 사용하면 객체의 키를 담는 새로운 배열 할당 없이 순회할 수 있어 GC 비용을 낮추고 성능을 향상시킬 수 있습니다.

**Action:** 객체 데이터를 합산하거나 집계할 때 등 반복 횟수가 많은 병목 경로(hot paths)에서는 `Object.keys()`, `Object.entries()` 대신 `for...in` 구문을 적극 활용하여 성능을 개선합니다.
