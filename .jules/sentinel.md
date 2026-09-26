## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.

## 2024-05-24 - [CSV Formula Injection in Sessions Export]
**Vulnerability:** CSV 매크로 삽입 (Spreadsheet Macro Injection). CSV 파일로 세션 기록을 내보낼 때, 세션 제목이나 첫 프롬프트가 `=`, `+`, `-`, `@` 등으로 시작할 경우 스프레드시트 프로그램에서 수식으로 해석해 악성 매크로를 실행할 위험이 있습니다.
**Learning:** `csvField` 함수에서 큰따옴표 이스케이프만 처리하고 수식 시작 문자에 대한 검증이 누락되었습니다.
**Prevention:** 숫자 타입이 아닌 문자열 값이 특정 기호(수식 시작 문자)로 시작할 경우 앞쪽에 단일 따옴표(`'`)를 추가해 일반 텍스트로 인식되도록 방어해야 합니다.
