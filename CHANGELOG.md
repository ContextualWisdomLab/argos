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

### ⚡ 성능 개선 (Performance)

- `SessionTimelineChart`에서 사용하는 데이터 집계 로직을 기존 O(N*M) 이중 루프 방식에서 O(N+M) 투 포인터 접근법으로 최적화하여 렌더링 성능을 개선했습니다.
- 복잡한 대규모 세션 시에도 차트 렌더링 속도가 향상되었습니다.
