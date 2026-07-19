## 2024-06-25 - [성능 최적화] 가상화 리스트(react-window) 렌더링 성능 향상
**Learning:** 가상화 리스트 컴포넌트(`react-window`의 `List` 등)에서 빠른 스크롤 시 `Row` 컴포넌트가 대량으로 마운트 및 언마운트되며 렌더링됩니다. 이때 렌더링 루프 내부에서 `new Date(timestamp).getTime()`과 같은 문자열 파싱을 수행하면 프레임 드랍이 발생하여 UI 버벅임을 유발할 수 있습니다.
**Action:** 무거운 파싱 작업은 `useMemo` 등을 통해 컴포넌트 외부(혹은 데이터 생성 시점)에서 사전 계산(pre-calculate)하여 `number` 타입의 원시(primitive) 값으로 `Row` 컴포넌트나 하위 함수에 전달하도록 아키텍처를 설계해야 합니다.
