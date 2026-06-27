## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2026-06-27 - ContextSection 키보드 접근성 및 스크린 리더 지원 개선
**Learning:** ContextSection의 토글 버튼에 `focus-visible` 스타일과 `aria-controls` 연결이 누락되어 접근성 결함이 있었습니다. `useId()`를 통한 고유 ID 연결과 `focus-visible` 처리를 추가해야 합니다.
**Action:** 앞으로 토글 UI 요소 구현 시, 탭 키 이동을 고려한 포커스 스타일 적용과 `aria-controls`/`aria-expanded`를 통한 콘텐츠 영역과의 시맨틱한 연결을 항상 확인합니다. 또한 시각적 장식인 아이콘에는 `aria-hidden="true"`를 적용합니다.
