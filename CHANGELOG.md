# Changelog

## [Unreleased]

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 설계된 데이터 모델의 테이블 및 컬럼 삭제 (`removeTable`, `removeColumn`) 기능과 참조 중인 외래키 연쇄 삭제 기능 추가
  - 컬럼 설정에 `UNIQUE` 제약 조건 지원 추가
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### 🛡️ 보안 패치 (Security)

- ERD 도구의 DDL 생성 과정에서 발생할 수 있는 SQL 인젝션 취약점 수정
  - 컬럼 타입에 세미콜론(;)과 같은 SQL 종료 문자가 삽입되는 것을 차단하는 `assertSafeSqlType` 검증 로직 추가

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
