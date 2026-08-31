## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2025-06-15 - Array.prototype.sort 내 Date.parse O(N log N) 병목
**Learning:** `Array.prototype.sort()`의 비교 함수 안에서 `Date.parse()`를 직접 호출하면, 정렬을 위한 반복적인 항목 비교마다(약 O(N log N)번) 무거운 문자열 파싱과 객체 할당이 일어나 브라우저와 노드 환경 모두에서 심각한 병목을 유발합니다.
**Action:** 타임스탬프와 같이 무거운 파싱이 필요한 값으로 정렬할 때는 `.map()`을 사용해 한 번의 O(N) 순회로 미리 파싱된 값을 담은 객체 배열을 만든 후 정렬하는 Schwartzian transform (Map-Sort-Map) 패턴을 적용해야 합니다.
