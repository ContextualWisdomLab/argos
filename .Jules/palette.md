## 2024-06-22 - Overview Stats 토글 버튼 키보드 접근성 개선
**Learning:** `overview-stats` 컴포넌트의 설명 텍스트를 펼치거나 접는 `<button>` 요소에 키보드 포커스 스타일이 누락되어 있어, 키보드 내비게이션 사용자에게 현재 포커스 위치를 명확히 보여주지 못했습니다. `hover` 스타일은 있었으나 `focus-visible` 처리가 없어 접근성 결함이 있었습니다.
**Action:** Tailwind CSS의 `focus-visible` 관련 유틸리티 클래스(`focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-ring`, `rounded-sm`)를 추가하여 탭(Tab) 키 이동 시 포커스 링이 보이도록 수정했습니다. 앞으로 대화형 컴포넌트를 설계할 때는 항상 키보드 접근성(focus states)을 염두에 두고 작업해야 합니다.

## 2024-07-10 - 접을 수 있는 영역(Collapsible Region) 접근성 개선
**Learning:** `ContextSection` 컴포넌트와 같이 아코디언 형태의 접을 수 있는 영역은 스크린 리더가 컨텐츠의 상태를 올바르게 인식하고 읽어주기 위해 토글 버튼과 컨텐츠 컨테이너 간의 명확한 ARIA 연결이 필요합니다. React의 `useId()` 훅을 사용하여 `aria-controls`, `id`, `aria-labelledby`를 동적으로 생성해 서로 연결하면 안정적입니다. 또한, 컨텐츠 영역에는 `role="region"`이 반드시 필요하다는 점을 확인했습니다.
**Action:** 향후 접을 수 있는 컴포넌트(Collapsible Region)를 만들거나 수정할 때는 항상 `useId()`를 사용하여 토글 버튼(`aria-controls`)과 컨텐츠 컨테이너(`id`, `role="region"`, `aria-labelledby`)를 동적으로 연결하도록 합니다. 추가로 키보드 네비게이션 사용자를 위한 명확한 포커스 링(`focus-visible` 관련 클래스 적용) 처리도 잊지 말아야 합니다.

## 2024-07-14 - 클립보드 복사 버튼의 시각적 피드백 및 아이콘 접근성 개선
**Learning:** `admin-dashboard` 컴포넌트의 비밀번호 재설정 링크 복사 버튼처럼, 클립보드 복사 기능이 있는 요소는 `Copied` 텍스트만으로 부족할 수 있습니다. `Copy` 아이콘을 복사 완료 시 2초간 `Check` 아이콘으로 동적으로 변경하는 시각적 피드백을 추가하면 사용자가 행동의 성공 여부를 훨씬 명확하게 인지합니다. 또한, 버튼 내부에 존재하는 `lucide-react`와 같은 장식용(순수 시각적) 아이콘은 스크린 리더 사용자가 중복된 정보를 듣지 않도록 반드시 `aria-hidden="true"` 속성을 부여해야 한다는 점을 발견했습니다.
**Action:** 앞으로 클립보드 복사와 같은 비동기적인 상호작용 성공 시에는 타이머(예: 2초)를 활용한 동적인 아이콘 교체 피드백(`Check` 아이콘 등)을 필수적으로 제공합니다. 더불어, 모든 대화형 버튼 내의 장식용 아이콘에는 접근성 향상을 위해 `aria-hidden="true"`를 빠짐없이 추가하도록 확인 절차를 강화합니다.
