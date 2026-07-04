## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2024-07-04 - 기본 `<button>` 태그 키보드 포커스 스타일 누락 패턴 발견
**Learning:** `@argos/web` 코드베이스에서 코어 UI인 `<Button>` 컴포넌트를 사용하지 않고 직접 `<button>` HTML 태그를 사용하는 컴포넌트들(예: DateRangePicker)에서 `focus-visible` 스타일이 적용되어 있지 않아 키보드 접근성 측면에서 사용자 경험이 떨어지는 문제를 확인했습니다.
**Action:** 인터랙티브한 기본 HTML `<button>` 엘리먼트를 다룰 때는 상황에 맞게 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` 등의 Tailwind 클래스를 추가하여 접근성을 유지해야 합니다.
