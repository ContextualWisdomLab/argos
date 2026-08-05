# Changelog

## [Unreleased]

### 🔐 보안 (Security)

- 현재 pnpm 잠금 파일에서 탐지된 OSV 취약 의존성을 패치하고, Dependency Review·OSV·Trivy·Semgrep 보안 게이트를 유지했습니다.
- 인증 입력에 요청 수준의 자원 한계를 추가하고, 레거시 bcrypt가 72 UTF-8 바이트 이후를 묵시적으로 잘라내는 동작을 공유 스키마와 서비스 경계에서 차단했습니다.
- NextAuth 직접 로그인, 회원가입, 관리자 로그인, 비밀번호 재설정에 현실적인 경계값·다국어 UTF-8·사전 차단 회귀 테스트를 추가했습니다.
- 비밀번호 처리 결정과 NIST SP 800-63B 및 OWASP 근거를 `docs/adr/0004-password-input-boundaries.md`에 기록했습니다.

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
