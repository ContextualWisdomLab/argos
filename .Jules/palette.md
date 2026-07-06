## 2026-07-06 - [접근성] 아코디언 컴포넌트 ARIA 속성 및 키보드 포커스 스타일 부재
**Learning:** 애플리케이션 내의 커스텀 인터랙티브 아코디언 컴포넌트(`ContextSection` 등)가 적절한 ARIA 속성을 통한 연결이 누락되어 있음(`aria-controls`, `role="region"`, `aria-labelledby` 누락). 또한, UI 원시 컴포넌트를 사용하지 않은 토글용 단순 `<button>` 요소에 명확한 키보드 포커스 인디케이터가 적용되어 있지 않은 점 발견.
**Action:** 앞으로 React의 `useId()`를 사용하여 고유한 ID를 동적으로 생성하고, 이를 통해 아코디언 토글 버튼과 콘텐츠 영역을 연결해야 함. 키보드 네비게이션 시 포커스가 잘 보이도록 모든 커스텀 인터랙티브 요소에 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset` 등 Tailwind 포커스 클래스를 명시적으로 추가해야 함.
