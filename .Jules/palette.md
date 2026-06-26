## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2025-01-10 - ContextSection 컴포넌트 접근성(A11y) 개선 (useId 활용)
**Learning:** 접이식 UI에서 하드코딩된 ID(예: `aria-controls="content"`)를 사용하면, 같은 컴포넌트가 페이지 내 여러 번 렌더링될 때 ID 충돌이 발생해 스크린 리더가 연결된 콘텐츠를 찾지 못하는 문제가 있었습니다.
**Action:** React의 내장 훅인 `useId()`를 도입하여 고유한 동적 ID(`contentId`)를 생성하고, 이를 토글 버튼의 `aria-controls`와 콘텐츠 영역의 `id`에 바인딩했습니다. 이를 통해 다중 렌더링 시에도 의미론적 연결(semantic linkage)이 안전하게 유지됩니다. 또한, 시각적 단서로만 사용되는 Chevron 아이콘에 `aria-hidden="true"` 속성을 부여해 스크린 리더의 불필요한 노이즈를 줄였습니다.