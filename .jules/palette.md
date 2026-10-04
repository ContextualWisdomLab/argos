## 2024-10-04 - 장식용 아이콘의 스크린 리더 중복 읽기 방지
**Learning:** 텍스트와 함께 사용되는 아이콘(예: PlusIcon)이나 버튼 안에서 aria-label로 이미 목적이 설명된 아이콘(예: ChevronLeftIcon, ChevronRightIcon)이 스크린 리더에게 불필요하게 읽히는 문제가 있었습니다.
**Action:** 장식용이거나 이미 의미가 전달된 아이콘에는 일관되게 `aria-hidden="true"`를 적용하여 불필요한 음성 출력을 방지해야 합니다.
