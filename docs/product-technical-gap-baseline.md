# Product/Technical Gap Baseline

## Accessibility (a11y)
- 장식용 아이콘(`aria-hidden="true"`)이 접근성 트리에서 생략되어 스크린 리더 사용자가 핵심 콘텐츠를 온전히 파악할 수 있도록 해야 함.
- 컨트롤이 아이콘 외의 요소로 이름과 상태를 나타낼 때, 감싸는 버튼/트리거(예: 페이지네이션, Select)는 여전히 명시적인 `aria-expanded` 또는 Accessible name을 유지해야 함.

## Testing Standards
- UI 상태 검증 시 단순히 아이콘의 속성 유무만 테스트(vacuous assertion)하지 말고, 아이콘의 상위 요소(컨트롤)가 이름이나 상태를 손실하지 않았는지(예: 렌더링된 요소의 `accessible name`, `aria-expanded` 값 등) 함께 검증해야 함.
