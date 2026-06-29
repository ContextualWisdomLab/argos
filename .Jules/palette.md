## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2026-06-29 - 키보드 접근성(Focus states) 개선 (다수 컴포넌트)
**Learning:** `org-sidebar`, `no-organization-state`, `context-section`, `session-files`, `event-list` 등 여러 커스텀 컴포넌트 내의 `<button>` 태그들이 시각적 hover 스타일은 존재하지만, 키보드 포커스 시의 시각적 피드백(`focus-visible`)이 누락되어 접근성 결함이 넓게 분포되어 있었습니다.
**Action:** 각 컴포넌트의 버튼 요소들에 `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring` 등의 유틸리티를 추가했습니다. 추후 UI 개발 시 가급적 공통된 `Button` 컴포넌트를 재사용하거나, 커스텀 상호작용 요소(interactive elements)를 설계할 때마다 키보드 접근성을 기본으로 고려해야 함을 상기해야겠습니다.
