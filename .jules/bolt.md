## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-05-24 - Map 객체 생성 및 배열 map 최적화
**Learning:** `new Map(rows.map(...))` 방식은 불필요한 중간 배열 할당과 Map 객체 생성, 그리고 메서드 호출(`get`, `set`) 오버헤드를 발생시킵니다.
**Action:** 데이터가 많을 때 가비지 컬렉터(GC) 압박을 줄이고 실행 속도를 높이기 위해, 일반 `Record` (객체)와 `for` 루프를 사용하여 배열을 순회하고 조립합니다.
