## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-22 - sort() 내부의 Date.parse() 반복 호출 최적화
**Learning:** `Array.prototype.sort()`의 comparator 내부에서 `Date.parse()`를 호출하면 요소들이 O(N log N)번 비교되는 과정에서 불필요한 문자열 파싱과 메모리 할당이 반복됩니다.
**Action:** Date 문자열을 정렬할 때는 `.map()`을 통해 단일 O(N) 패스에서 파싱(Schwartzian transform)을 미리 수행한 뒤에, 원시 숫자 값들끼리만 정렬하도록 변경해야 합니다.
