## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-10-18 - .filter().map() 체이닝에 의한 메모리 오버헤드와 최적화 및 Array.prototype.sort() 내부의 Date 파싱 병목 해결
**Learning:** .filter().map()을 연속으로 사용할 경우, 중간 과정에서 임시 배열이 생성되어 가비지 컬렉터(GC)에 부담을 주며 메모리 사용량을 증가시킵니다. 특히 useMemo 내부에서 메시지 리스트와 같이 크기가 클 수 있는 배열을 순회할 때 이 오버헤드는 더욱 두드러집니다. 또한 Array.prototype.sort() 비교자 내부에서 Date.parse()를 직접 호출하면, O(N log N) 비교마다 날짜 파싱이 반복되어 심각한 성능 병목이 발생할 수 있습니다.
**Action:** .filter().map() 체이닝은 단일 for...of 루프로 통합하여 O(N) 순회 1번으로 데이터를 추출하도록 변경해야 합니다. 배열을 날짜 기준으로 정렬할 때는 정렬 전에 O(N) 순회 1번으로 미리 날짜를 파싱하여 저장(memoize)한 뒤, 해당 값을 기준으로 정렬을 수행하여 반복적인 파싱 오버헤드를 방지해야 합니다.
