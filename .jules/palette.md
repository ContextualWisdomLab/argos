## 2024-09-27 - [OverviewStats Collapse Button Icon Fix]
**Learning:** `overview-stats.tsx` 컴포넌트의 토글 버튼에 사용된 `▸` 같은 문자 기호는 화면 리더기에 따라 다르게 읽히거나 예측할 수 없는 스타일링 이슈를 일으킬 수 있습니다. 또한 디자인 시스템의 다른 부분에서 `lucide-react`를 사용하는 것과 일관성이 없습니다.
**Action:** 앞으로는 텍스트 기호 대신 항상 표준 아이콘 라이브러리(`lucide-react`)의 컴포넌트(예: `ChevronRight`)를 사용하고, 해당 아이콘이 장식용인 경우 `aria-hidden="true"`를 적절히 설정합니다.
