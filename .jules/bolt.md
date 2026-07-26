## 2024-07-26 - [가상화 리스트 렌더링 성능 최적화: 고정된 날짜 파싱 오버헤드 제거]
**Learning:** `react-window`와 같은 가상화 리스트 컴포넌트 내부(Row 렌더러)에서 매번 동일한 고정 날짜(`sessionStartedAt`)를 `new Date(sessionStartedAt).getTime()`으로 파싱하면 스크롤 시마다 불필요한 객체 생성 및 파싱 비용이 발생하여 렌더링 성능 저하를 유발합니다.
**Action:** 부모 컴포넌트(`EventList`)에서 `useMemo`를 통해 변하지 않는 고정된 날짜값을 한 번만 숫자(밀리초)로 파싱하여 계산하고, 이를 Row 컴포넌트의 props로 전달하여 불필요한 연산을 방지해야 합니다.
