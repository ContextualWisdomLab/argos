## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2026-09-01 - [배열 집계 성능 최적화: reduce 대신 for...of 사용]
**Learning:** Array.prototype.reduce는 함수 호출 및 콜백 스택 오버헤드로 인해 요소가 많거나 잦은 렌더링이 발생하는 React 컴포넌트에서 병목이 될 수 있음을 확인했습니다.
**Action:** React 렌더링 최적화(hot paths)가 필요한 경우, reduce 대신 기존의 for 루프나 for...of 루프를 사용하여 GC 오버헤드를 줄이고 CPU 사이클을 절약합니다.
