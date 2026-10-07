## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-10-07 - useMemo와 reduce를 활용한 값비싼 배열 연산 최적화

**Learning:** 렌더링 시마다 `Math.max(...array)`와 같은 연산을 큰 배열에 대해 수행하면 불필요한 계산 오버헤드가 발생하며, 호출 스택 초과(Call stack size exceeded) 오류를 유발할 위험이 있습니다.

**Action:** 빈번하게 재계산될 필요가 없는 파생 데이터나 값비싼 배열 축약 연산(예: 최대값 찾기)은 `useMemo`로 감싸서 이전 렌더링 결과를 재사용하십시오. 큰 배열에 대한 `Math.max(...array)` 사용을 피하고, 대신 `reduce`와 `Math.max(m, a)`를 결합한 안전한 방식을 적용하십시오. 훅이 조기 반환(early return) 전에 선언되도록 Hook의 규칙을 철저히 지키십시오.
