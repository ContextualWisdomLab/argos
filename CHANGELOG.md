# Changelog

## [Unreleased]

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
## [Unreleased]

### Fixed
- **Admin Dashboard**: Repaired the accessibility and UX pattern for the "Copy link" action. Replaced dynamic button renaming with a robust sibling status container.
  - See W3C. (2023). *WCAG 2.2 Success Criterion 4.1.3 Status Messages*. Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/#status-messages
  - See W3C. (2016). *ARIA22: Using role=status to present status messages*. Web Content Accessibility Guidelines Techniques. https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22
  - See W3C. (2016). *G199: Providing success feedback when data is submitted successfully*. Web Content Accessibility Guidelines Techniques. https://www.w3.org/WAI/WCAG22/Techniques/general/G199
  - See W3C. (2016). *ARIA19: Using ARIA role=alert or Live Regions to Identify Errors*. Web Content Accessibility Guidelines Techniques. https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19
  - Automated DOM tests added, though they do not prove screen-reader support across all possible combinations.
