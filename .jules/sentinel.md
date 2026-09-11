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

## 2025-02-18 - [Fix SQL Injection in ERD Tool]
**Vulnerability:** SQL Injection in ERDTool via untrusted table/column mutation and unvalidated SQL types.
**Learning:** In-memory state getters (`getTable`) exposed references to internal state allowing mutation bypass of `assertSnakeCaseIdentifier`. Column types lacked validation.
**Prevention:** Return deep copies (using `structuredClone`) for getter methods, deep copy inputs for setters, and validate `column.type` using a allowlist regex (`SAFE_SQL_TYPE`).

## 2025-02-18 - [Fix vulnerable dependencies via pnpm overrides]
**Vulnerability:** Known high-severity vulnerabilities discovered by the audit in `js-yaml` and `nanoid` packages.
**Learning:** Deeply nested dependencies (`js-yaml` via `eslint`, `nanoid` via `vitest/vite`) may expose the application to DoS or logic loops.
**Prevention:** Use `pnpm.overrides` in the root `package.json` to enforce patched versions across all transitive paths in a pnpm workspace.

## 2026-09-11 - [CSV Formula Injection (Macro Injection) 취약점 방어]
**Vulnerability:** 대시보드 세션 CSV Export 시 사용자 입력값 (Session Title, First Prompt)에 대한 필터링이 없어 악성 페이로드(ex: `=cmd|`, `+123`, `@eval`)가 주입될 경우, 스프레드시트 툴에서 임의 수식 및 명령어가 실행될 위험이 존재함.
**Learning:** `csvField` 포맷팅 유틸리티가 단순한 문자열 escape(큰따옴표, 줄바꿈)만 처리하고, 매크로 유발 문자로 시작하는지에 대한 검증(Formula Injection 방어) 로직이 누락되어 있었음.
**Prevention:** 모든 CSV 필드 생성 시 숫자 타입을 제외한 값의 시작이 매크로 유발 문자(`=`, `+`, `-`, `@`, `\t`, `\r`, `\n` 및 전각 문자 등)인지 검사하여 싱글 쿼트(`'`)를 앞에 추가하도록 일관되게 처리해야 함. 이를 위해 공용 서버 유틸리티로 분리하여 코드 재사용성을 높여야 함.
