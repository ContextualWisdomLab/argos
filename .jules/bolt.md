## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-10-04 - React Hook Rules when Optimizing Render with useMemo
**Learning:** useMemo나 useCallback을 사용해 컴포넌트 내부의 성능 저하 로직(reduce 같은 무거운 배열 연산)을 최적화할 때, 기존에 있던 조기 리턴(early return) 구문 뒤에 훅을 추가하면 `react-hooks/rules-of-hooks` 에러가 발생합니다.
**Action:** React 훅을 추가하여 최적화를 진행할 때는 반드시 컴포넌트의 최상단, 즉 어떤 조건문이나 조기 리턴보다도 앞서서 선언되도록 코드를 구조화해야 합니다.
