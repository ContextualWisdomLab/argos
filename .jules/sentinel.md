## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.

## 2025-02-28 - CSV 매크로 삽입(Injection) 취약점 수정
**Vulnerability:** 사용자 입력 데이터가 CSV 파일로 내출력 될 때 수식 기호(=, +, -, @)로 시작하는 문자열을 필터링 없이 그대로 포함할 경우 엑셀 등 스프레드시트 앱에서 임의의 수식이나 매크로가 실행되는 CSV Injection 취약점이 존재했습니다.
**Learning:** `format: csv` 등과 같이 사용자가 요청한 파일을 생성할 때에는 DB에 있는 데이터라 하더라도 스프레드시트 애플리케이션의 동작(수식 실행 등)에 영향을 미칠 수 있음을 알게 되었습니다.
**Prevention:** CSV 생성을 위한 필드 처리 함수(`csvField` 등)에서는 반드시 `=, +, -, @` 및 탭, 캐리지 리턴 등으로 시작하는 문자열을 만나면 맨 앞에 작은따옴표(`'`)를 추가하여 수식으로 해석되지 않도록 처리(escape)해야 합니다.

## 2026-09-14 - 취약점 있는 패키지 의존성 버전 업데이트
**Vulnerability:** trivy-fs 보안 스캔 결과 `baseline-browser-mapping`, `browserslist`, `deepmerge-ts`, `next`, `sharp` 패키지에서 MEDIUM ~ CRITICAL 등급의 취약점들(CVE-2026-45819, CVE-2026-73088, CVE-2026-73089, CVE-2026-40345, CVE-2026-75604, GHSA-2xp9-vwfh-vxw4, GHSA-rgj7-g3m4-5g8c)이 발견되었습니다.
**Learning:** 애플리케이션 코드에 직접적인 취약점이 없더라도, 사용하는 오픈소스 라이브러리의 취약점을 통해 공격당할 수 있습니다.
**Prevention:** 의존성 취약점이 발견되면 `pnpm.overrides` 블록을 사용해 취약점이 패치된 최신 버전으로 덮어쓰거나 업데이트하여 lockfile을 갱신해야 합니다.
