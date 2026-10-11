## 2025-02-19 - 배열 최댓값 계산 시 Math.max와 스프레드 연산자 사용으로 인한 성능 및 콜 스택 이슈 해결
**Learning:** React 컴포넌트(`DelegationInsight`, `MembersPage`, `TopUsersList` 등)에서 리스트 렌더링 시 배열의 최댓값을 구하기 위해 `Math.max(...array)`를 사용하면 배열 크기가 클 때 'Maximum call stack size exceeded' 에러가 발생할 수 있습니다. 또한 매 렌더링 주기마다 무거운 동기적 계산을 반복하여 성능 저하를 초래합니다.
**Action:** 항상 `Math.max(...array)` 대신 `.reduce((max, item) => Math.max(max, item), 0)`를 사용하여 모든 크기의 데이터셋을 안전하게 처리해야 합니다. React 컴포넌트에서 이러한 파생 값을 계산할 때는 `useMemo`로 감싸 데이터가 변경될 때만 재계산되도록 하여 불필요한 렌더링을 방지해야 합니다.
