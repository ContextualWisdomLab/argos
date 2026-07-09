## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.
## 2024-05-18 - Host Header Injection 방어
**Vulnerability:** HTTP Host 헤더를 신뢰하여 `req.nextUrl.origin` 등을 사용하여 절대 URL(비밀번호 재설정 링크, CLI 인증 콜백 등)을 생성하는 경우, 공격자가 악성 Host 헤더를 전송하여 사용자에게 피싱 사이트 링크를 전송하게 만들 수 있는 Host Header Injection 취약점이 존재했습니다.
**Learning:** Next.js의 `req.nextUrl.origin`은 클라이언트가 보낸 Host 헤더를 기반으로 작동할 수 있으므로, 인증이나 권한 부여와 관련된 절대 URL을 생성할 때는 절대로 사용자 입력(Host 헤더 포함)을 신뢰해서는 안 됩니다.
**Prevention:** 절대 URL을 생성할 때는 항상 신뢰할 수 있는 서버 환경 변수인 `process.env.NEXT_PUBLIC_SITE_URL` (또는 백업용으로 하드코딩된 'https://argos-ai.xyz')을 사용하여 사용자 입력(Host 헤더)을 통한 변조를 원천적으로 차단해야 합니다.
