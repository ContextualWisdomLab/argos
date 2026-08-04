## 2024-07-15 - ARIA Labels & Title Attributes

**Learning:** 세션 삭제 버튼이나 날짜 사전 설정(preset) 버튼과 같은 아이콘 단독 버튼이나 짧은 텍스트 버튼에는 범용적인 `aria-label`만으로는 충분한 컨텍스트를 제공하기 어렵다는 점을 확인했습니다. (예: "Delete" -> "Delete session: [Name]").
**Action:** 범용적인 aria-label이 있다면 객체의 구체적인 컨텍스트를 주입할 수 있는지 확인하고, 화면 판독기와 마우스 사용자 모두를 위해 `title` 속성과 일치시키도록 적용해야 합니다.
