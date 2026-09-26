## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - 정적인 Markdown renderer 재사용과 memoization 가설

**Learning:** 정적인 `components` map을 렌더 함수 밖에서 재사용하면 참조 할당을 줄일 수 있습니다. `React.memo`의 실제 이득은 parent update 빈도, prop 안정성, 비교 비용과 Markdown 렌더 비용에 따라 달라지므로 프로파일 없이 일반 규칙이나 성능 향상으로 단정할 수 없습니다.
**Action:** 고정 corpus에서 React commit duration·render count·main-thread time의 환경, warm-up, 표본 수, failure denominator, median/p95를 기록합니다. 동작 parity가 유지되고 효과가 양수일 때만 `React.memo`를 유지하며, 효과가 없거나 비교 비용이 더 크면 제거합니다.
