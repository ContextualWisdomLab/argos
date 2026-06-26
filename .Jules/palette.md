## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.## 2026-06-26 - Session Files 모달 버튼 키보드 접근성 개선
**Learning:** `session-files.tsx`의 요약 버튼("file modified", "file read")과 개별 파일 리스트 버튼에 키보드 포커스 스타일이 누락되어 있었습니다. Tailwind의 `focus-visible`이 없어 시각적인 피드백 없이 탭 이동이 발생했습니다.
**Action:** 상호작용 요소(`<button>`)에 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` 클래스를 추가하여 접근성을 높였습니다. 탭 이동을 지원하는 모든 버튼에는 항상 명확한 포커스 표시가 필요합니다.
