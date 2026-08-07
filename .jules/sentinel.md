## 2025-02-15 - [Security Enhancements: URL Hardcoding & Security Headers]
**Vulnerability:** Hardcoded external URLs (https://argos-ai.xyz/dashboard) and missing critical HTTP Security Headers (X-Frame-Options, Strict-Transport-Security, etc.) were found in the application configuration.
**Learning:** Hardcoded production URLs in authentication flows (like impersonation) can cause dangerous cross-domain redirects if the application is self-hosted on a different domain. Missing security headers leaves the application vulnerable to basic UI redressing (Clickjacking) and MITM attacks without HSTS.
**Prevention:** Always use relative paths (e.g., `/dashboard`) or dynamic environment variables (`NEXT_PUBLIC_SITE_URL`) for internal redirects. Always configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`) globally via `next.config.ts`.
## 2025-02-15 - [Host Header Injection 방지]
**Vulnerability:** `req.nextUrl.origin`을 사용하여 동적으로 URL을 생성하는 부분(비밀번호 초기화 링크 생성, CLI 인증 URL 등)에서 Host Header Injection 취약점이 발생할 수 있었습니다. 악의적인 사용자가 HTTP Host 헤더를 조작하여 피싱 사이트나 악성 스크립트가 호스팅된 서버로의 링크를 사용자에게 보낼 수 있습니다.
**Learning:** Next.js의 `NextRequest` 객체에서 제공되는 `req.nextUrl.origin`은 클라이언트가 보낸 HTTP Host 헤더의 값에 의존하므로, 안전하지 않은 환경(특히 신뢰할 수 없는 요청)에서 절대적인 URL을 만들 때 사용하면 보안 위험이 있습니다.
**Prevention:** 절대적인 URL(예: 인증 콜백, 비밀번호 초기화 링크 등)을 생성할 때는 클라이언트가 제공한 헤더(`req.nextUrl.origin` 등)를 신뢰하지 말고, 미리 정의된 신뢰할 수 있는 환경 변수(예: `process.env.NEXT_PUBLIC_SITE_URL`)를 사용해야 합니다.

## 2026-07-10 - DoS via slow PBKDF2 hashing for environment secrets
**Vulnerability:** Slow PBKDF2 hashing was applied to an in-memory plain text environment variable (`ADMIN_PASSWORD`).
**Learning:** Applying slow cryptographic hashing to secrets originating from and remaining in memory provides zero additional security (since the secret is already accessible) but introduces a critical Denial-of-Service (DoS) risk, as attackers can force the server to execute expensive hash updates.
**Prevention:** Use fast uniform hashes (like SHA-256) when comparing plain text environment secrets to avoid timing attacks, rather than slow key derivation functions like PBKDF2. Always enforce length checking on inputs before hashing.

## 2025-07-08 - [Fix timing attack vulnerability in signature verification]
**Vulnerability:** A custom buffer length check (`if (signatureBytes.length !== expectedSignatureBytes.length) return false`) before calling `crypto.timingSafeEqual()` leaked the length of the expected signature, enabling timing attacks.
**Learning:** Never use custom 'homebrew' buffer-padding logic to match lengths for `crypto.timingSafeEqual()`, as early returns leak the length of the secret.
**Prevention:** Ensure inputs are hashed to a uniform length (e.g., using `crypto.createHash('sha256')`) before comparison.
## 2025-02-18 - Missing Max Password Length (bcrypt DoS)
**Vulnerability:** The standard user authentication routes (login, register, and reset-password) did not have a maximum length constraint on passwords. This allows an attacker to supply extremely long strings, which `bcrypt` will try to hash, causing CPU exhaustion and creating a Denial of Service (DoS) vulnerability.
**Learning:** `bcrypt` (and `bcryptjs`) is intentionally slow. While `bcrypt` may internally truncate passwords to 72 bytes, depending on the implementation the input string processing itself or the full string parsing before truncation can be very costly. In this codebase, the admin authentication correctly checked for a max length, but user schemas did not.
**Prevention:** Always enforce a maximum string length limit (e.g. `.max(1024)`) on user inputs that will be passed into expensive algorithms like bcrypt hashing.

## 2025-02-18 - [ERD 모델의 SQL 인젝션 및 상태 변이 우회 취약점 수정]
**Vulnerability:** `ERDModel` 클래스에서 컬럼 타입 및 기본값에 대한 정규식 검증이 누락되어 악의적인 SQL 문법이 삽입될 수 있었으며, 내부 상태 객체(테이블)가 직접 반환되어 검증 로직을 우회하여 상태 변이가 발생할 수 있었습니다.
**Learning:** DDL 생성 시 자유 텍스트나 타입 입력이 포함될 때는 반드시 허용 목록(Allowlist) 기반 정규식을 사용해야 하며, 객체 상태를 반환할 때는 캡슐화를 보장하기 위해 깊은 복사(Deep Copy)를 수행해야 검증 우회를 방지할 수 있습니다.
**Prevention:** 정규식(예: `SAFE_SQL_TYPE`, `SAFE_SQL_DEFAULT_VALUE`)을 도입하여 타입과 기본값을 검증하고, 객체를 반환할 때 `JSON.parse(JSON.stringify(table))`를 사용하여 원본 참조를 숨깁니다.

## 2026-07-02 - [Fix High Severity Vulnerability in js-yaml]
**Vulnerability:** `js-yaml` versions 4.0.0 through versions below 4.3.0 were affected by quadratic CPU consumption in YAML merge-key chains (CVE-2026-59869, GHSA-52cp-r559-cp3m), allowing crafted YAML input to cause denial of service. Version 4.3.0 is patched.
**Learning:** `pnpm` 환경에서 서드파티 패키지의 하위 의존성에 존재하는 취약점을 수정할 때, 직접적인 `package.json` 업데이트로 해결되지 않는다면 `pnpm.overrides`를 적극 활용하여 전체 프로젝트 수준에서 특정 안전한 버전을 강제할 수 있습니다.
**Prevention:** `pnpm audit`과 같은 도구를 주기적으로 실행하여 취약점을 점검하고, 루트 `package.json`의 `"pnpm": { "overrides": { ... } }` 구문을 사용해 취약점이 패치된 버전을 고정(pin)합니다.
