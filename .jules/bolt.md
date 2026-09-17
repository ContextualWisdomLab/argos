## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-24 - 날짜 문자열 정렬 시 Schwartzian transform(map-sort-map) 사용

**Learning:** 배열 정렬 시 비교 함수 내부에서 `Date.parse`를 사용하면 O(N log N)번의 문자열 파싱 연산이 발생합니다. 이는 대용량 타임라인이나 데이터셋을 다룰 때 성능 병목이 됩니다.

**Action:** 정렬하기 전에 Schwartzian transform(map-sort-map) 패턴을 사용하여 `Date.parse` 값을 미리 계산합니다. 매핑 단계에서 원본 객체를 전개 연산자(`...item`)로 복사하면 얕은 복사가 O(N)번 발생하므로 객체 전개 대신 참조를 유지하도록 래핑 객체를 사용합니다.
