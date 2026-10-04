## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-10-04 - 페이지네이션과 COUNT 쿼리를 CTE로 통합

**Learning:** `Promise.all`을 사용하여 페이지네이션 쿼리(`LIMIT`/`OFFSET`)와 전체 개수 카운트(`COUNT(*)`) 쿼리를 동시에 실행하면 동일한 필터 조건에 대해 데이터베이스가 불필요한 이중 스캔을 수행하여 병목이 발생할 수 있습니다. PostgreSQL에서는 CTE(`WITH` 구문)로 필터링된 기본 데이터셋을 한 번만 계산하고, 이를 기반으로 스칼라 서브쿼리(`(SELECT COUNT(*) FROM cte)`)를 활용하면 데이터베이스 왕복 횟수와 중복 스캔 비용을 모두 줄일 수 있습니다.
**Action:** 페이지네이션 구현 시 메인 데이터 조회가 무겁거나 복잡한 조인이 필요한 경우, 별도의 쿼리를 병렬 실행하기보다 단일 쿼리 내에서 CTE와 서브쿼리를 결합하여 쿼리를 최적화합니다.
