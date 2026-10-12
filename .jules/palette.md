## 2026-10-12 - Admin dashboard copy link UX improvement
**Learning:** 관리자 대시보드의 'Copy link' 버튼과 같이 클립보드 복사 기능을 제공하는 버튼에서 복사 후 시각적/접근성 피드백이 부족한 경우 사용자가 복사 성공 여부를 알기 어렵다. 복사 상태 표시 유지 시간 부족으로 인해 버튼 피드백이 일시적으로만 제공되거나 아예 제공되지 않으면 혼란을 줄 수 있다.
**Action:** `navigator.clipboard.writeText`를 사용하는 복사 버튼에는 항상 `copied` 상태를 관리하는 `setTimeout`을 추가하여 잠시 동안 피드백을 유지하고, `Check` 아이콘 및 `aria-live="polite"`, `aria-pressed`를 활용하여 시각적 및 스크린리더 피드백을 강화해야 한다.
