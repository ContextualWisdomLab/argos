## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2025-07-10 - 커스텀 리스트 행에 Focus Ring 및 ARIA Expanded 추가
**Learning:** 커스텀 인터랙티브 행(가상화된 목록이나 아코디언 섹션에서 사용되는 버튼 등)은 시맨틱 클릭을 위해 `<button>`을 사용하지만, Tailwind 리셋을 사용할 경우 기본 브라우저 포커스 링이 시각적으로 누락되는 경우가 많습니다. 또한 콘텐츠를 펼치거나 접는 행은 스크린 리더에 상태를 전달하기 위해 명시적으로 `aria-expanded`를 관리해야 합니다.
**Action:** 클릭 가능한 커스텀 행을 구현할 때는 항상 포커스 스타일(예: `focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none`)을 명시적으로 추가하고, 행이 하위 콘텐츠의 가시성을 제어하는 경우 `aria-expanded`를 사용하세요. 이러한 행 내의 장식용 아이콘은 `aria-hidden="true"`를 사용하여 숨겨야 합니다.