# Changelog

## [Unreleased]

### 🛡️ 보안 강화 (Security)

- Next.js 애플리케이션(`packages/web/next.config.ts`)에 브라우저 보안 헤더(`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)를 추가하여 Clickjacking, XSS 등의 웹 취약점을 방어하도록 보안을 강화했습니다.

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.
