## 2024-05-30 - 가상화된 리스트 내 날짜 파싱 최적화
**Learning:** `react-window`와 같은 가상화된 리스트는 스크롤이나 상태 업데이트 시 row renderer를 자주 호출합니다. 만약 row renderer 내에서 동적으로 날짜 객체를 반복 파싱(예: `new Date(sessionStartedAt).getTime()`)하게 되면, 매번 O(V)의 Date 할당과 파싱 오버헤드가 발생하여 성능 저하와 가비지 컬렉션(GC) 부담을 초래합니다.
**Action:** row renderer 외부(부모 컴포넌트 레벨)로 날짜 파싱 로직을 끌어올려 `useMemo`로 단 1회만 계산하고, row renderer에는 불필요한 객체 생성을 피하도록 원시 타입인 `number` 값을 전달해야 합니다.
