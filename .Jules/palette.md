
## 2024-07-29 - Overview stats chevron icon replacement
**Learning:** `overview-stats.tsx` 파일에서 설명 토글 버튼에 텍스트 기반 쉐브론(`▸`)이 사용되고 있었으며, 이는 `ContextSection` 등 `lucide-react` 아이콘(`ChevronRight`)을 사용하는 다른 컴포넌트들과 시각적 일관성이 부족함을 발견함.
**Action:** 확장/축소(토글) 섹션을 구현할 때는 시각적 일관성과 정렬을 위해 텍스트 기호 대신 디자인 시스템의 표준 아이콘 라이브러리(`lucide-react`의 `ChevronRight` 등)를 사용해야 함. 스크린 리더에서 읽히지 않도록 `aria-hidden="true"`를 적절히 적용해야 함.
