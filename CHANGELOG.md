# Changelog

## [Unreleased]

### 🛡️ 보안 (Security)

- Admin impersonation은 같은 출처의 `/admin/impersonate?token=...`만 허용합니다. 교차 출처, 자격 증명, 추가 쿼리, hash, 공백 토큰은 이동하지 않습니다. 고객을 클릭하거나 검색 결과에서 빠지면 진행 중인 재설정 링크·가장 세션 요청은 UI에 적용되지 않습니다. 잘못된 고객의 링크를 복사하거나 잘못된 세션으로 들어가기 전에, 지금 선택된 고객에서 동작을 다시 시작하십시오.
- 로그인, 회원가입, 비밀번호 재설정이 하나의 공유 비밀번호 계약을 사용하도록 통합했습니다. 입력 처리량을 1,024자로 먼저 제한하고, 현재 `bcryptjs`가 완전하게 검증할 수 있는 72 UTF-8 바이트를 초과하는 값은 조용히 잘라내지 않고 거부합니다. ASCII와 다중 바이트 Unicode 경계 회귀 테스트 및 운영·표준 근거 문서를 함께 추가했습니다.

### ⚡ 성능 (Performance)

- 세션 타임라인의 사용량 시점마다 전체 도구 이벤트를 다시 필터링하던 중첩 스캔을 정렬된 로컬 복사본과 단일 순방향 커서로 교체했습니다. 이후 시점의 도구 요약은 이전 호출을 누락하지 않고 누적되며, 반복 도구 횟수·표시 개수 상한·입력 배열 불변성을 실제 차트 데이터 회귀 테스트로 고정했습니다.
- 가상화 이벤트 목록에서 모든 visible row가 동일한 세션 시작 시각 문자열을 반복 파싱하던 경로를 제거했습니다. 세션 anchor는 prop이 바뀔 때만 `Date.parse`로 계산하고 숫자 값을 행에 전달하며, elapsed-time 동작은 순수 formatter와 invalid/negative 시간 회귀 테스트로 고정했습니다.

### ✨ 추가 기능 (Feature)

- ERD (Entity-Relationship Diagram) 엔진의 코어 모델 클래스(`ERDModel`)를 신규 구현했습니다.
  - 테이블 추가, 컬럼 추가 (이름, 타입, 기본키 및 Null 제약 조건) 기능 제공
  - 참조 테이블 및 컬럼 기반 외래키(Foreign Key) 설정 기능 제공
  - 설계된 데이터 모델을 바탕으로 PostgreSQL 호환 DDL 생성 기능 제공
  - 관련 모든 기능에 대한 유닛 테스트(100% 커버리지) 추가 구현 완료

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.