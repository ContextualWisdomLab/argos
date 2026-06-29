# Changelog

## [Unreleased]

### 🛡️ 변경 사항 (보안)

- `next.config.ts` 파일에 X-Frame-Options, X-Content-Type-Options, X-XSS-Protection 등의 보안 헤더를 전역적으로 추가하여 Clickjacking, MIME-type sniffing 등 일반적인 웹 취약점을 방어하도록 강화했습니다.

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
