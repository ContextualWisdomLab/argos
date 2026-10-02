## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-02 - CTE 쿼리를 이용한 `Promise.all` 동시 호출 최적화
**Learning:** `Promise.all`로 `SELECT` (정렬/랭크)와 `COUNT` (총 개수) 쿼리를 동시에 실행하면 백엔드와 DB 간에 커넥션이 2개 할당되고 쿼리가 두 번 실행되는 비효율이 발생합니다.
**Action:** CTE (Common Table Expression)를 사용하여 하나의 쿼리 안에서 `COUNT`를 구하고 그 결과를 `CROSS JOIN`하여 함께 반환하도록 최적화함으로써, DB 왕복 횟수를 줄이고 쿼리 지연 시간과 커넥션 부하를 크게 낮춥니다.
