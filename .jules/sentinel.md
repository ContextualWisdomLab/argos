## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.

## 2025-02-28 - CSV 매크로 삽입(Injection) 취약점 수정
**Vulnerability:** 사용자 입력 데이터가 CSV 파일로 내출력 될 때 수식 기호(=, +, -, @)로 시작하는 문자열을 필터링 없이 그대로 포함할 경우 엑셀 등 스프레드시트 앱에서 임의의 수식이나 매크로가 실행되는 CSV Injection 취약점이 존재했습니다.
**Learning:** `format: csv` 등과 같이 사용자가 요청한 파일을 생성할 때에는 DB에 있는 데이터라 하더라도 스프레드시트 애플리케이션의 동작(수식 실행 등)에 영향을 미칠 수 있음을 알게 되었습니다.
**Prevention:** CSV 생성을 위한 필드 처리 함수(`csvField` 등)에서는 반드시 `=, +, -, @` 및 탭, 캐리지 리턴 등으로 시작하는 문자열을 만나면 맨 앞에 작은따옴표(`'`)를 추가하여 수식으로 해석되지 않도록 처리(escape)해야 합니다.
