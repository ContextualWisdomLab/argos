## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-06-25 - DateRangePicker Preset Toggle 버튼 키보드/스크린리더 접근성 개선
**Learning:** `DateRangePicker`의 프리셋 버튼("7d", "30d" 등)에 키보드 포커스 스타일과 현재 선택된 상태를 알려주는 속성이 누락되어 있었습니다. 세그먼트 컨트롤처럼 동작하는 버튼 그룹에서는 시각적 상태뿐만 아니라 스크린 리더 사용자에게 현재 선택 상태를 알려주는 `aria-pressed`가 중요하며, 키보드 내비게이션을 위한 `focus-visible` 처리가 필수적입니다.
**Action:** Tailwind의 `focus-visible` 유틸리티(`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`)를 추가하여 포커스를 명확히 하고, `aria-pressed={activePreset === preset.days}`를 적용하여 선택 상태의 접근성을 강화했습니다. 앞으로 토글 형태의 버튼을 만들 때는 이 패턴을 일관되게 적용해야 합니다.
