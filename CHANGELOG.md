# Changelog

## [Unreleased]

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### ⚡ 성능 개선 (Performance)

- 웹 대시보드의 최상위 사용자 목록 컴포넌트(`TopUsersList`)에서 `maxTokens` 계산 로직을 `useMemo`로 래핑하고 조건문 밖으로 분리하여 불필요한 계산을 줄이고 훅 오류 발생을 방지했습니다. 관련 단위 테스트도 100% 커버리지로 추가했습니다.

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
