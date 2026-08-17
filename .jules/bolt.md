## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-17 - O(N log N) Date.parse in sort comparator

**Learning:** `Array.prototype.sort()` 비교 함수 내부에 `Date.parse()`를 넣으면 파싱 비용이 N log N 번 반복 호출되며 큰 데이터에서 성능 병목을 일으킵니다.
**Action:** 타임스탬프를 정렬할 때는 단일 O(N) 패스인 `.map()`을 사용하여 원시 timestamp 값을 사전에 구한 뒤 이 값을 기준으로 정렬하여 파싱 오버헤드를 줄입니다.
