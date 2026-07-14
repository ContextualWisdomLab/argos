## 2024-07-14 - [React 렌더링 최적화] Date 객체 생성 비용 최소화
**Learning:** React의 inner loop (예: `.map()` 내부)에서 `new Date(string).getTime()`을 반복 호출하는 것은 성능 저하를 일으킬 수 있습니다. 특히 배열 이전/다음 항목을 비교하기 위해 매 반복마다 다시 객체를 생성하면 불필요한 GC(가비지 컬렉션) 오버헤드가 발생합니다.
**Action:** 루프 밖에서 고정된 날짜 문자열은 미리 변환하고(`sessionStartMs`), 루프 내의 항목들은 한번 파싱 후 그 값을 다음 반복에 넘기도록 상태(`prevTimestamp`)를 유지합니다. 또한 유틸리티 함수(`formatRelativeTime`)가 문자열뿐만 아니라 `number` 타입도 직접 받도록 오버로딩하여 불필요한 재파싱을 방지해야 합니다.
