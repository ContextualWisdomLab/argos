## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-20 - 핫 패스(hot path)에서 Object.keys() 대신 for...in 루프 사용

**Learning:** Object.keys()는 키들을 담을 배열을 할당하기 때문에, 일일 집계와 같은 대용량 데이터 구조를 병합할 때 불필요한 힙(heap) 스래싱과 가비지 컬렉션(GC) 오버헤드를 발생시킵니다.
**Action:** 최대의 순회 성능이 요구되는 핫 패스에서는 가드된 for...in 루프(예: `for (const k in obj) { if (Object.hasOwn(obj, k)) { ... } }`)를 사용하여 배열 할당을 완전히 제거해야 합니다.
