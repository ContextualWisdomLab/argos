## 2026-07-30 - [React Virtualized List] 날짜 파싱 최적화
**Learning:** React Virtualized (예: `react-window`) 내에서 렌더링되는 모든 항목에서 공통적인 문자열을 파싱(`new Date().getTime()`)하게 되면, 리스트 내 항목 수만큼 무거운 계산이 반복되어 성능 저하가 발생합니다.
**Action:** 부모 컴포넌트에서 `useMemo`를 사용해 문자열 형태의 정적 데이터를 렌더링 루프 외부에서 미리 숫자로 파싱한 후, 이를 하위 렌더링 함수(예: Row)에 prop으로 전달하도록 합니다.
