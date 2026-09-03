## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2024-07-10 - 접을 수 있는 영역(Collapsible Region) 접근성 개선
**Learning:** `ContextSection` 컴포넌트와 같이 아코디언 형태의 접을 수 있는 영역은 스크린 리더가 컨텐츠의 상태를 올바르게 인식하고 읽어주기 위해 토글 버튼과 컨텐츠 컨테이너 간의 명확한 ARIA 연결이 필요합니다. React의 `useId()` 훅을 사용하여 `aria-controls`, `id`, `aria-labelledby`를 동적으로 생성해 서로 연결하면 안정적입니다. 또한, 컨텐츠 영역에는 `role="region"`이 반드시 필요하다는 점을 확인했습니다.
**Action:** 향후 접을 수 있는 컴포넌트(Collapsible Region)를 만들거나 수정할 때는 항상 `useId()`를 사용하여 토글 버튼(`aria-controls`)과 컨텐츠 컨테이너(`id`, `role="region"`, `aria-labelledby`)를 동적으로 연결하도록 합니다. 추가로 키보드 네비게이션 사용자를 위한 명확한 포커스 링(`focus-visible` 관련 클래스 적용) 처리도 잊지 말아야 합니다.

## 2024-11-20 - CopyPromptButton 접근성 향상 (동적 텍스트 및 상태)
**Learning:** `CopyPromptButton`과 같이 버튼을 클릭했을 때 시각적으로만 상태가 변하고(예: 복사 아이콘이 체크 아이콘으로 변경), 텍스트가 동적으로 변경되는 컴포넌트에서는 스크린 리더 사용자가 상태 변화를 알아채기 어렵습니다. 또한 스크린 리더가 순수 장식용 아이콘까지 불필요하게 읽을 수 있습니다.
**Action:** 동적으로 변경되는 텍스트를 `<span aria-live="polite">`로 감싸 스크린 리더가 즉시 변경 사항을 읽어주도록 해야 합니다. `<Button>` 컴포넌트에는 `aria-pressed={copied}`를 추가하여 토글 성격을 부여하고, 시각적인 아이콘 컴포넌트(예: `<Copy>`, `<Check>`)에는 `aria-hidden="true"`를 추가하여 스크린 리더에서 무시하도록 처리하는 패턴을 지속적으로 사용해야 합니다.
## 2026-08-28 - 빈 주간 리포트 화면에 시각적 안내 아이콘 추가
**Learning:** 데이터가 없을 때 표시되는 EmptyState(빈 화면)의 경우 텍스트만 렌더링하면 미완성 페이지나 에러가 난 것처럼 보일 위험이 있음. 이를 방지하려면 연관된 아이콘(예: BarChart3)과 원형 배경을 함께 중앙 정렬하여 시각적 완성도와 신뢰감을 제공하는 UX 패턴이 효과적임.
**Action:** 데이터가 비어 있는 EmptyState 관련 컴포넌트를 설계할 때는 항상 연관된 아이콘이나 일러스트와 함께 배치하고 flexbox를 통해 중앙 정렬하도록 한다. 또한 장식용 아이콘에는 `aria-hidden="true"`를 적용하여 접근성 지침을 준수해야 한다.
