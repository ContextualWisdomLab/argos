## 2024-05-24 - [EventList 가상화 리스트 렌더링 최적화]
**Learning:** `react-window`를 사용하는 가상화 리스트(`List`)에서 각 항목(`Row`)을 렌더링할 때 문자열 기반의 날짜 생성(`new Date(dateString)`)이 포함되어 있으면, 스크롤 이벤트 발생 시마다 메인 스레드를 과도하게 점유하여 프레임 드랍이 발생할 수 있습니다.
**Action:** 정적인 계산값(`sessionStartedAt` 등 전체 리스트에 동일하게 적용되는 기준 시간)은 렌더링 루프 내부(`formatElapsed`)에 두지 않고, 리스트 컴포넌트 최상단에서 `useMemo`로 캐싱한 후 `rowProps`를 통해 하위로 전달해야 합니다.
