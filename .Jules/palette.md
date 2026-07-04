## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-04 - Segment Controls State Accessibility
**Learning:** React segment controls/toggles (like preset buttons) built with basic buttons often visually distinguish the active state (e.g. using a background color) but fail to communicate this to screen readers. They also easily miss standard keyboard focus outlines when built with custom padding/borders.
**Action:** 항상 커스텀 토글/세그먼트 컨트롤 버튼을 구현할 때는 `aria-pressed={isActive}` 속성을 추가하여 상태를 스크린 리더에 명시적으로 알리고, `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` 클래스를 적용해 키보드 네비게이션 시 명확한 시각적 피드백을 제공해야 한다.
