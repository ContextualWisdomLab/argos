# Changelog

## [Unreleased]

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.

### 🛡️ 보안 수정 사항

- API 라우트(`password-reset-links`, `cli-request`)에서 `req.nextUrl.origin` 대신 `process.env.NEXT_PUBLIC_SITE_URL`을 사용하여 Host 헤더 주입 취약점을 수정했습니다.
