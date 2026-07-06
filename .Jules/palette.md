## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-06-22 - 날짜 범위 선택기(Segment Control) 접근성 및 포커스 상태 개선
**Learning:** `date-range-picker` 컴포넌트의 날짜 프리셋 버튼들(Segment Control 형태)에 키보드 포커스 스타일(`focus-visible`)이 누락되어 있었고, 선택된 상태를 스크린 리더에 알리는 `aria-pressed` 속성과 그룹을 묶어주는 `role="group"` 및 `aria-label`이 없어 접근성이 떨어졌습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 클래스를 추가하여 키보드 탭 이동 시 포커스가 명확히 보이게 하고, `role="group"`, `aria-label`, `aria-pressed`를 추가해 스크린 리더 사용자가 현재 활성화된 날짜 범위를 알 수 있게 개선했습니다. 커스텀 라디오/세그먼트 컨트롤을 만들 때 항상 이 패턴을 적용해야 합니다.
