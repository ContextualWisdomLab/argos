## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-01 - ContextSection 컴포넌트 아코디언 접근성 향상
**Learning:** `ContextSection` 같은 커스텀 아코디언(펼침/접힘) UI를 구현할 때, 토글 `<button>`과 숨겨지는 콘텐츠 `<div>` 간의 관계를 스크린 리더에 명확히 전달하기 위해 `React.useId()`를 사용하여 생성한 고유 ID를 `aria-controls`와 콘텐츠 `id`에 각각 부여해야 합니다. 또한, 마우스 hover 스타일만으로는 키보드 내비게이션 사용자에게 현재 포커스 위치를 보여줄 수 없으므로 `focus-visible` 관련 유틸리티(`focus-visible:ring-2`)를 반드시 함께 적용해야 완벽한 접근성을 달성할 수 있습니다.
**Action:** 앞으로 커스텀 토글 또는 아코디언 UI를 작성할 때 항상 `useId()`와 `aria-controls` 조합을 사용하여 스크린 리더 지원을 추가하고, `focus-visible` 스타일을 적용해 키보드 포커스 시각 피드백을 보장합니다.
