## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-10-24 - Array.prototype.sort() 내부의 date 파싱을 피하세요
**Learning:** `Array.prototype.sort()` 비교기 안에서 `Date.parse()`를 호출하면 O(N log N)의 성능 병목이 발생하여, 동일한 타임스탬프 문자열을 반복해서 구문 분석하게 됩니다.
**Action:** 정렬하기 전에 한 번의 O(N) 패스로 미리 날짜를 구문 분석하도록 Schwartzian transform 패턴을 사용하세요. 그리고 중복 계산을 완전히 없애기 위해 이어지는 작업에서도 파싱된 값을 다시 사용하세요.
