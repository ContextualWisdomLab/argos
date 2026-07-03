## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-03 - Date Range Picker 기간 설정 버튼 키보드 접근성 개선
**Learning:** `DateRangePicker` 컴포넌트의 프리셋 기간(7일, 30일 등)을 선택하는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자(Tab 이동)가 현재 포커스된 버튼을 식별할 수 없는 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`)를 추가하여 탭(Tab) 키 이동 시 명확한 포커스 링이 표시되도록 수정했습니다. `button.tsx` 외에 직접 `<button>` 태그를 사용하는 컴포넌트들에 대해 포커스 스타일 누락 여부를 지속적으로 확인해야 합니다.
