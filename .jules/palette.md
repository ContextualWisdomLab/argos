## 2024-05-18 - [아이콘 중복 읽기 방지]
**Learning:** 버튼이나 링크 안에 시각적 텍스트나 `aria-label`이 이미 존재하는 경우, 장식용 아이콘에 `aria-hidden="true"`를 명시적으로 추가해야 스크린리더가 중복으로 읽거나 의미 없는 정보를 전달하는 것을 방지할 수 있습니다.
**Action:** `aria-label`이 부여된 네비게이션 버튼(예: Pagination, WeekNavigator) 내의 Chevron 아이콘 등에 항상 `aria-hidden="true"`를 적용할 것.
