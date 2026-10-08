## 2026-10-08 - [React 배열 전개 연산자(Spread Operator) 최대값 계산 성능 이슈]
**Learning:** React 컴포넌트 내에서 `Math.max(...array.map(x => x.value))` 패턴을 사용할 경우, 배열의 크기가 매우 크면 전개 연산자가 모든 요소를 함수의 인수로 전달하여 'Maximum call stack size exceeded' 에러를 유발할 수 있습니다. 또한 이 연산이 렌더링될 때마다 동기적으로 실행되면 불필요한 연산 오버헤드가 발생합니다.
**Action:** 큰 배열의 최대값을 구할 때는 전개 연산자 대신 항상 `.reduce()` 메서드를 사용해야 합니다. 또한, 이러한 무거운 데이터 파생 로직은 `useMemo`로 감싸고, 조건부 이른 반환(early return) 이전에 최상단에 배치하여 훅 규칙을 준수해야 합니다.
## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
