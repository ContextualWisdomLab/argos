## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-07-02 - 커스텀 버튼에 포커스 표시 누락
**Learning:** 대시보드 전반에 걸쳐 사용된 커스텀 상호작용 요소(이벤트 목록 행, 파일 목록 행, 프리셋 버튼 등)인 `<button>` 요소들에 `focus-visible` 유틸리티 클래스가 누락되어 있었습니다. 이로 인해 키보드 내비게이션 사용 중 현재 포커스 된 요소를 식별하기가 매우 어려웠습니다.
**Action:** 자체 포커스 상태를 처리하는 기본 `Button` 컴포넌트를 사용하지 않는 커스텀 상호작용 요소를 구축할 때는 항상 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`과 같은 적절한 클래스를 적용하여 키보드 접근성을 유지해야 합니다.
