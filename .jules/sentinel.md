## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.

## 2025-02-15 - [호스트 헤더 인젝션 취약점]
**Vulnerability:** API 라우트에서 호스트를 생성할 때 `req.nextUrl.origin`을 사용함으로써 악의적인 사용자가 변조된 호스트 헤더를 전송하여 원치 않는 도메인으로 리다이렉트나 인증 정보가 유출될 수 있는 위험성을 발견함.
**Learning:** `req.nextUrl.origin`과 같이 클라이언트가 통제할 수 있는 입력값을 기반으로 인증 콜백이나 비밀번호 재설정 링크의 절대 URL을 생성하면 보안에 취약하다는 점을 학습함.
**Prevention:** 절대 URL을 구성할 때는 항상 `process.env.NEXT_PUBLIC_SITE_URL`과 같은 검증된 환경 변수를 사용하여 호스트 헤더 인젝션을 방지해야 함.