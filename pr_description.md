💡 What
- `ContextSection` 컴포넌트의 토글 버튼에 명확한 키보드 포커스 스타일(`focus-visible`)을 추가했습니다.
- React의 `useId()` 훅을 사용하여 버튼과 콘텐츠 영역 간의 `aria-controls` 및 `id` 연결을 동적으로 생성했습니다.

🎯 Why
- **키보드 접근성:** 기존 토글 버튼은 키보드(Tab 키)로 탐색 시 포커스 상태가 명확하게 보이지 않아 어떤 요소가 선택되었는지 알기 어려웠습니다.
- **스크린 리더 호환성:** 하나의 페이지에 여러 `ContextSection`이 존재할 때 하드코딩된 ID로 인해 발생할 수 있는 충돌을 방지하고, 스크린 리더가 버튼과 숨겨진 콘텐츠 간의 논리적 연결을 정확히 파악할 수 있도록 개선했습니다.

📸 Before/After
- Playwright 시각적 확인을 통해 포커스 스타일(`ring-2`)이 적용됨을 확인 완료했습니다.

♿ Accessibility
- `aria-controls` 및 고유 `id` 부여 (스크린 리더 네비게이션 향상)
- `focus-visible:ring-2` 등 유틸리티 클래스 추가 (키보드 네비게이션 시인성 향상)
