# Changelog

## [Unreleased]

### 🛡️ 보안 업데이트 (Security)

- **[CRITICAL] Host Header Injection 취약점 수정:** 비밀번호 재설정 링크(`password-reset-links/route.ts`)와 CLI 인증 콜백(`cli-request/route.ts`) 생성 시 사용되던 신뢰할 수 없는 `req.nextUrl.origin`을 환경 변수 `process.env.NEXT_PUBLIC_SITE_URL`로 교체하여 조작된 Host 헤더를 통한 피싱 사이트 유도 취약점을 방지했습니다.

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.