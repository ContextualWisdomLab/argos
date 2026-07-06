## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-06 - ContextSection 토글 접근성 개선
**Learning:** 펼침/접힘과 같은 인터랙티브 요소는 적절한 포커스 가시성과 스크린 리더 연결이 누락되는 경우가 많습니다. `useId()`를 사용하여 `aria-controls`를 연결하면 충돌을 방지할 수 있으며, 장식용 아이콘에 `aria-hidden="true"`를 추가하면 스크린 리더의 불필요한 노이즈를 줄일 수 있습니다.
**Action:** 커스텀 버튼에는 항상 `focus-visible` 유틸리티 클래스를 적용하고, `useId()`를 사용하여 `aria-controls`와 `aria-expanded`를 연결하십시오.
