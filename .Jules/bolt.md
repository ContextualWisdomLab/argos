## 2024-05-18 - SessionTimelineChart N*M Rendering Loop Optimization
**Learning:** React 컴포넌트 렌더링 시, `usageTimeline`(N)과 `toolCalls`(M) 두 배열이 모두 시간 순으로 정렬되어 있음에도 불구하고, 이전에는 O(N*M) 복잡도로 중첩 순회를 통해 렌더링(Tool summary 매칭)을 수행하고 있었습니다. 이는 배열 크기가 커짐에 따라 리렌더링 병목 현상을 유발할 수 있습니다.
**Action:** 두 배열이 모두 시간순 정렬 속성을 가지고 있다는 점을 활용하여 O(N+M) 투포인터(two-pointer) 병합 알고리즘을 사용하도록 최적화합니다. 또한, 반복적인 Date 파싱은 루프 외부에서 한 번만 수행하여 객체 할당(garbage collection) 및 파싱 오버헤드를 줄입니다.
