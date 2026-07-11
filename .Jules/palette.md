## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-11 - Context Section 컴포넌트 접근성 개선
**Learning:** `ContextSection` 컴포넌트와 같이 열림/닫힘(disclosure) 기능을 하는 요소에서는 단순히 `aria-expanded`만 제공하는 것으로는 부족합니다. 스크린 리더 사용자가 토글 버튼과 열리는 콘텐츠 사이의 관계를 명확히 인지할 수 있도록, 고유한 ID를 부여하여 `aria-controls`와 `aria-labelledby`로 연결해야 합니다. 특히 React 18부터 제공되는 `useId()` 훅을 사용하면 컴포넌트가 여러 번 렌더링되더라도 고유하고 안정적인 ID를 쉽게 생성할 수 있어 이러한 접근성 패턴을 구현하는 데 매우 유용합니다. 또한, 아이콘 같은 장식적인 요소는 `aria-hidden="true"` 속성으로 스크린 리더에서 무시되도록 처리하는 것이 좋습니다.
**Action:** 앞으로 접근성 향상이 필요한 컴포넌트를 설계하거나 수정할 때는 `useId()`를 적극적으로 활용하여 요소 간의 관계를 명확히 연결해야겠습니다.
