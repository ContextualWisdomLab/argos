## 2024-08-13 - Array.prototype.sort() 안의 Date.parse() 최적화
**Learning:** `Array.prototype.sort()`의 comparator 함수 안에서 `Date.parse(timestamp)`를 호출하면 O(N log N)의 복잡도로 인해 성능 병목이 발생하며, 불필요한 메모리 할당 및 CPU 오버헤드가 발생합니다. 특히 배열 크기가 클 경우 렌더링을 차단하거나 지연시킬 수 있습니다.
**Action:** 타임스탬프를 기준으로 배열을 정렬해야 할 때는 먼저 `Array.prototype.map()`을 사용하여 O(N)으로 미리 타임스탬프를 파싱한 후 정렬하고, 순회가 필요할 경우 파싱된 타임스탬프를 재사용하여 계산 복잡도와 오버헤드를 최소화합니다.

## 2024-08-13 - Array.prototype.sort() 안의 Date.parse() 최적화
**Learning:** `Array.prototype.sort()`의 comparator 함수 안에서 `Date.parse(timestamp)`를 호출하면 O(N log N)의 복잡도로 인해 성능 병목이 발생하며, 불필요한 메모리 할당 및 CPU 오버헤드가 발생합니다. 특히 배열 크기가 클 경우 렌더링을 차단하거나 지연시킬 수 있습니다.
**Action:** 타임스탬프를 기준으로 배열을 정렬해야 할 때는 먼저 `Array.prototype.map()`을 사용하여 O(N)으로 미리 타임스탬프를 파싱한 후 정렬하고, 순회가 필요할 경우 파싱된 타임스탬프를 재사용하여 계산 복잡도와 오버헤드를 최소화합니다.
