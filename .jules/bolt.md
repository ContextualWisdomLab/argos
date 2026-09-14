## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-09-14 - `Object.keys()` 배열 할당 오버헤드 최적화
**Learning:** 일별/주별 롤업 데이터 집계와 같이 크기가 큰 데이터를 순회하는 핫패스에서 `Object.keys()`를 사용하면 매 순회마다 모든 키를 포함하는 새로운 배열이 메모리에 할당되어 가비지 컬렉션(GC) 오버헤드와 힙 메모리 낭비(heap thrashing)를 유발합니다.
**Action:** 대규모 객체를 반복 순회하는 핫패스에서는 배열 할당을 완전히 피하기 위해 `Object.keys()` 대신 `for...in` 루프와 `if (Object.hasOwn(obj, key))` 검사를 결합하여 사용합니다.
