## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2024-07-10 - 접을 수 있는 영역(Collapsible Region) 접근성 개선
**Learning:** `ContextSection` 컴포넌트와 같이 아코디언 형태의 접을 수 있는 영역은 스크린 리더가 컨텐츠의 상태를 올바르게 인식하고 읽어주기 위해 토글 버튼과 컨텐츠 컨테이너 간의 명확한 ARIA 연결이 필요합니다. React의 `useId()` 훅을 사용하여 `aria-controls`, `id`, `aria-labelledby`를 동적으로 생성해 서로 연결하면 안정적입니다. 또한, 컨텐츠 영역에는 `role="region"`이 반드시 필요하다는 점을 확인했습니다.
**Action:** 향후 접을 수 있는 컴포넌트(Collapsible Region)를 만들거나 수정할 때는 항상 `useId()`를 사용하여 토글 버튼(`aria-controls`)과 컨텐츠 컨테이너(`id`, `role="region"`, `aria-labelledby`)를 동적으로 연결하도록 합니다. 추가로 키보드 네비게이션 사용자를 위한 명확한 포커스 링(`focus-visible` 관련 클래스 적용) 처리도 잊지 말아야 합니다.

## 2026-08-08 - 동적 텍스트 상태 변경에 대한 스크린 리더 접근성 개선
**Learning:** 사용자의 액션에 따라 버튼 텍스트가 변경될 때(예: 'Copy' -> 'Copied'), 단순히 텍스트만 변경하면 포커스가 이동하지 않는 한 스크린 리더는 새로운 상태를 자동으로 읽어주지 않습니다.
**Action:** 앞으로 상호작용 요소 내부에서 텍스트 상태가 동적으로 변경될 경우, 변경되는 텍스트를 `<span aria-live="polite">`로 감싸서 사용자가 명시적으로 포커스를 재설정하지 않더라도 화면 낭독기가 상태 변화를 부드럽게 인지하고 피드백을 제공할 수 있도록 해야 합니다. 아이콘 버튼과 같이 시각적 텍스트가 없는 경우에는 `<span className="sr-only" aria-live="polite">`를 활용합니다.
