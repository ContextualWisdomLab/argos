## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - 정적인 객체 Props 분리 및 React.memo 사용

**Learning:** `components={{ ... }}`와 같이 인라인 객체를 `ReactMarkdown`과 같은 자주 사용되는 컴포넌트에 전달하면, 매 렌더링마다 객체 참조가 변경되어 불필요한 리렌더링을 유발합니다.
**Action:** 정적인 객체는 컴포넌트 렌더 함수 외부로 분리하고, 순수 컴포넌트의 경우 `React.memo`로 감싸서 성능을 최적화합니다.
