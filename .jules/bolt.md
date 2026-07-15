
## 2024-07-15 - React 루프 내부의 `new Date().getTime()` 병목 현상 방지
**Learning:** React 컴포넌트의 `useMemo` 내부에서 큰 배열을 렌더링하거나 매핑할 때, 매 반복마다 `new Date().getTime()`과 같은 문자열 파싱 작업을 수행하면 심각한 성능 저하(오버헤드)가 발생할 수 있습니다. 특히 렌더링 경로의 깊은 루프에서는 이러한 연산이 누적되어 병목 현상을 유발합니다. 또한 `let prev = 0`처럼 외부 변수를 선언해 루프 내부에서 재할당하면 `react-hooks/immutability` lint 에러가 발생합니다.
**Action:** 루프를 실행하기 전에 배열의 모든 문자열 날짜를 미리 파싱하여 숫자(timestamp)로 변환한 `parsedTimeline`과 같은 새로운 배열을 생성하세요. 그리고 루프 내부에서는 계산된 속성(`parsedTimestamp`)을 단순 참조만 해야 합니다. 이전 값을 참조해야 할 때는 외부 변수를 변이시키는 대신 배열 인덱스(`array[index - 1]`)를 사용하여 React의 불변성 원칙을 준수하세요.
