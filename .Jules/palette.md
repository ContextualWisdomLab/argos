## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.
## 2024-03-08 - 모달 폼 에러 메시지 접근성 개선 (ARIA 속성 적용)
**Learning:** `create-org-modal`, `delete-org-modal` 등 여러 모달 내 폼에서 에러 발생 시 텍스트만 표시되고 스크린 리더에서 에러 내용을 즉각 인지하기 어려웠습니다. `aria-describedby`를 통해 인풋 요소와 에러 메시지를 연결하고 `role="alert"`를 활용해 에러를 즉각 발표하게 만들면 접근성이 크게 향상됨을 확인했습니다.
**Action:** 폼 유효성 검사 에러를 렌더링할 때 항상 `id`와 `role="alert"`를 명시하고, 대상 `<Input>` 컴포넌트에서 `aria-invalid` 및 `aria-describedby`를 연결하는 패턴을 기본적으로 적용해야 합니다.
