## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2024-07-10 - 접을 수 있는 영역(Collapsible Region) 접근성 개선
**Learning:** `ContextSection` 컴포넌트와 같이 아코디언 형태의 접을 수 있는 영역은 스크린 리더가 컨텐츠의 상태를 올바르게 인식하고 읽어주기 위해 토글 버튼과 컨텐츠 컨테이너 간의 명확한 ARIA 연결이 필요합니다. React의 `useId()` 훅을 사용하여 `aria-controls`, `id`, `aria-labelledby`를 동적으로 생성해 서로 연결하면 안정적입니다. 또한, 컨텐츠 영역에는 `role="region"`이 반드시 필요하다는 점을 확인했습니다.
**Action:** 향후 접을 수 있는 컴포넌트(Collapsible Region)를 만들거나 수정할 때는 항상 `useId()`를 사용하여 토글 버튼(`aria-controls`)과 컨텐츠 컨테이너(`id`, `role="region"`, `aria-labelledby`)를 동적으로 연결하도록 합니다. 추가로 키보드 네비게이션 사용자를 위한 명확한 포커스 링(`focus-visible` 관련 클래스 적용) 처리도 잊지 말아야 합니다.

## 2024-07-28 - 복사 버튼 등 상태 변경 피드백 접근성 개선
**Learning:** `CopyPromptButton`처럼 사용자가 버튼을 클릭했을 때 아이콘이 변경되거나 텍스트가 "복사됨"으로 바뀌는 경우, 스크린 리더 사용자에게는 이러한 시각적인 변화나 텍스트 변경이 즉각적으로 전달되지 않는 문제가 있었습니다. 버튼 안의 텍스트가 변경되더라도 자동으로 읽어주지 않습니다.
**Action:** 상태에 따라 변경되는 텍스트를 `<span aria-live="polite" aria-atomic="true">`로 감싸서, 복사 완료 같은 피드백이 스크린 리더를 통해 즉각적으로 안내될 수 있도록 해야 합니다. 또한, 시각적 용도로만 사용되는 `lucide-react` 아이콘에는 항상 `aria-hidden="true"`를 부여하여 스크린 리더가 불필요하게 아이콘을 읽으려 시도하는 것을 방지해야 합니다.
