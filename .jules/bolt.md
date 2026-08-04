## 2024-08-04 - [Performance] Optimize date parsing in tight loops

**Learning:** V8 엔진에서 ISO 문자열을 밀리초(Timestamp)로 변환할 때, `new Date(string).getTime()`은 객체 할당 오버헤드가 발생하여 성능이 저하된다. 반면 `Date.parse(string)`은 객체를 생성하지 않고 바로 숫자를 반환하므로 성능이 유의미하게(약 1.8배) 더 빠르다. 특히 React 렌더링 루프나 큰 데이터 배열을 순회할 때 이 차이는 측정 가능한 수준의 병목이 될 수 있다. 추가로 `react-window` 등을 사용하는 가상화 리스트(`EventList`)에서, 변경되지 않는 기준 시간(`sessionStartedAt`)을 리스트의 `Row` 컴포넌트 내부에서 계속 파싱하지 않고, 부모 컴포넌트에서 `useMemo`로 미리 파싱(`sessionStartedAtMs`)하여 숫자 타입으로 넘겨주면, O(visible_items) 단위의 파싱 연산을 O(1)로 줄일 수 있다.

**Action:** 문자열 파싱이나 고비용 계산은 렌더링 루프 이전에 `useMemo`를 통해 처리한 후 프리미티브(숫자) 형태로 자식 컴포넌트에 넘기는 패턴을 준수한다. 성능이 중요한 루프 내부에서는 `new Date(string).getTime()` 대신 객체 할당을 피할 수 있는 `Date.parse(string)`을 사용한다.