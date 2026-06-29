# Changelog

## [Unreleased]

### 🛡️ 보안 수정 사항

- 대시보드 세션 내역을 CSV로 다운로드할 때 사용자 입력값(예: 프롬프트 첫 메시지)에 수식 문자(=, +, -, @ 등)가 포함된 경우 엑셀에서 임의의 코드가 실행될 수 있는 CSV Injection (Formula Injection) 취약점을 방지하도록 텍스트 이스케이프 로직을 강화했습니다.

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
