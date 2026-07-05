## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-05 - ContextSection 아코디언 접근성 및 포커스 개선
**Learning:** `ContextSection` 같은 사용자 정의 아코디언 컴포넌트를 만들 때, 버튼과 콘텐츠 영역이 스크린 리더에서 올바르게 연결되지 않는 문제가 자주 발생합니다. 또한 단순히 시각적인 hover 상태만 주어지고 키보드 focus 상태가 명확하지 않으면 키보드 탐색 사용자에게 불편함을 줍니다.
**Action:** React의 `useId` 훅을 사용하여 버튼(`aria-controls`)과 콘텐츠 영역(`id`, `role="region"`, `aria-labelledby`)을 동적으로 안전하게 연결하는 패턴을 적용합니다. 장식용 아이콘은 `aria-hidden="true"`로 숨기고, 버튼에는 `focus-visible:ring` Tailwind 클래스를 일관되게 추가하여 키보드 접근성을 확보해야 합니다.
