## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-12 - Date.parse를 sort comparator 내부에서 피하기
**Learning:** `Array.prototype.sort()`의 비교 함수 내부에서 `Date.parse()`를 호출하면 각 비교마다 불필요한 파싱이 발생하여 O(N log N)의 성능 병목을 초래합니다.
**Action:** 날짜 파싱이 필요한 배열 정렬 시, 정렬 전에 `.map()`을 사용하여 O(N)으로 미리 파싱된 값을 생성한 뒤 정렬하여 중복 연산을 방지해야 합니다.
