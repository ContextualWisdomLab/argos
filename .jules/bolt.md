## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2023-09-15 - [객체 키 순회 최적화]

**Learning:** `Object.keys()`는 객체의 키 배열을 생성하므로 GC 부하가 큽니다. 데이터 합산 등 대량의 객체를 순회하는 뜨거운 경로(hot paths)에서는 `for...in` 반복문과 `Object.hasOwn`을 함께 사용하면 불필요한 배열 생성을 막을 수 있습니다.

**Action:** `packages/web/src/lib/server/daily-rollup.ts` 등에서 대규모 데이터를 통합할 때 `Object.keys()` 대신 `for...in`과 `Object.hasOwn()` 조합을 사용하여 객체 속성을 순회하십시오.
## 2023-09-15 - [O(N log N) 전체 정렬을 O(N) 순회로 대체하여 리더보드 추출 성능 향상]

**Learning:** 배열 전체를 `sort()` 하여 상위 몇 개 항목만 추출하는 패턴(O(N log N))은 후보군 배열 크기가 클 때 성능 병목이 될 수 있습니다.

**Action:** 가장 우수한 상위 N개 요소만 필요할 경우, 배열 전체를 정렬하는 대신 O(N) 한 번의 순회로 최고 요소들을 추적하도록 최적화하십시오 (`packages/web/src/lib/server/weekly-report.ts`의 `pickLeader` 참고).
