## 2025-02-12 - [TopUsersList 컴포넌트 성능 최적화]
**Learning:** React 함수형 컴포넌트에서 초기 데이터 배열이 빈 경우 early return 처리하는 패턴이 자주 사용되는데, 이 때 early return 구문 아래쪽에 값비싼 연산이나 `useMemo` 등의 훅(Hook)이 선언되면 React Hook Error가 발생할 수 있습니다.
**Action:** 항상 모든 React 훅은 최상단 (early return 조건문 이전)에서 선언하여 컴포넌트 렌더링 시 조건부로 실행되지 않도록 강제하며, 비용이 드는 연산에 대해서는 의존성 배열에 주의하여 `useMemo`로 캐시합니다. 빈 배열에 대한 `reduce` 처리는 초기값을 명시하여 에러를 피해야 합니다.
