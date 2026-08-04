# Changelog

## [Unreleased]

### 🛡️ 보안 (Security)

- 로그인, 회원가입, 비밀번호 재설정이 하나의 공유 비밀번호 계약을 사용하도록 통합했습니다. 입력 처리량을 1,024자로 먼저 제한하고, 현재 `bcryptjs`가 완전하게 검증할 수 있는 72 UTF-8 바이트를 초과하는 값은 조용히 잘라내지 않고 거부합니다. ASCII와 다중 바이트 Unicode 경계 회귀 테스트 및 운영·표준 근거 문서를 함께 추가했습니다.

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
