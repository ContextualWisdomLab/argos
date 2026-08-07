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

## 2025-08-07 - Mutation Bypass를 통한 SQL Injection 취약점 방지
**Vulnerability:** `packages/web/src/lib/erd.ts` 내의 `ERDModel` 클래스에서 `getTable`, `addTable`, `addColumn`, `addForeignKey` 등의 메서드가 객체의 참조(reference)를 반환하거나 내부 배열에 그대로 저장하여, 외부에서 객체의 프로퍼티(예: `table.name`, `column.type`)를 임의로 변조(mutation)할 수 있는 취약점이 존재했습니다. 이를 통해 SQL Injection 필터링을 우회하고 악의적인 DDL 문을 주입할 수 있었습니다.
**Learning:** 식별자에 대한 유효성 검사(Snake Case 등)를 수행하더라도, 상태 객체가 참조로 노출되면 언제든지 검증 이후에 값을 변조하여 SQL 주입 공격을 수행할 수 있습니다.
**Prevention:** 상태를 관리하는 클래스에서 객체를 반환하거나 내부 배열에 추가할 때는 항상 `structuredClone()` 등을 사용하여 깊은 복사(deep copy)를 수행하여 외부 변조를 차단해야 합니다.

## 2026-08-07 - OSV-Scanner 취약점 탐지 및 의존성 강제 고정
**Vulnerability:** 의존성 스캔 중 `js-yaml`과 `nanoid` 패키지에서 알려진 보안 취약점이 발견되었습니다. 해당 패키지들은 다른 패키지의 하위 의존성(transitive dependency)으로 설치되고 있었습니다.
**Learning:** 직접 설치하지 않은 하위 의존성이라도 전체 애플리케이션의 보안에 영향을 미칠 수 있으며, 의존성 트리 깊은 곳에 있는 취약점은 발견 및 수정이 어려울 수 있습니다.
**Prevention:** `pnpm audit` 또는 `osv-scanner`와 같은 도구를 CI 파이프라인에 통합하여 지속적으로 스캔하고, 취약점이 발견될 경우 `package.json`의 `pnpm.overrides`를 활용하여 안전한 패치 버전으로 강제 고정(override)하여 선제적으로 방어해야 합니다.
