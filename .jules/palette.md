## 2024-05-24 - 불필요한 스크린 리더 아이콘 낭독 방지 (ContextSection 아코디언)
**Learning:** 아코디언 토글 버튼 내부의 방향 아이콘(Chevron)은 부모 요소의 `aria-expanded` 속성으로 상태가 이미 완벽히 전달되므로 `aria-hidden="true"`를 생략하면 스크린 리더 사용 시 시각적 장식이 중복으로 읽히는 문제가 발생함.
**Action:** 상태를 시각적으로만 보조하는 장식용 아이콘에는 항상 `aria-hidden="true"`를 추가하여 스크린 리더 경험을 간결하게 유지한다.
## 2026-09-27 - ContextSection 접근성 개선 (aria-hidden)
**Learning:** `ContextSection` 컴포넌트 내부에서 아코디언 상태(open/close)를 나타내는 `ChevronUp`, `ChevronDown` 아이콘이 화면 판독기에 중복으로 읽히는 문제가 있었습니다. 아코디언 버튼 자체에서 `aria-expanded`로 이미 열림/닫힘 상태를 전달하고 있으므로 아이콘에 `aria-hidden="true"`를 추가하면 스크린 리더 경험이 간결해집니다.
**Action:** 부가적인 시각 정보만 제공하는 장식용 아이콘에는 항상 `aria-hidden="true"`를 적용하여 스크린 리더의 불필요한 음성 출력을 최소화합니다.
