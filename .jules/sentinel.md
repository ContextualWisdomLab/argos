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

## 2025-02-18 - [Fix CSV Formula Injection in Session Exports]
**Vulnerability:** 사용자 입력이 포함된 세션 데이터를 CSV 파일로 추출할 때, Spreadsheet Macro Injection (CSV Injection)을 방지하기 위한 필터링이 누락되어 있었습니다. 세션 제목이 `=cmd|' /C calc'!A0` 와 같은 형태로 저장되면 다운로드 후 Excel 등에서 열람 시 수식 실행이나 데이터 유출로 이어질 수 있습니다.
**Learning:** CSV 구조 이스케이핑과 스프레드시트 수식 중립화는 별개의 경계입니다. 현재 OWASP CSV Injection 가이드는 ASCII `=`, `+`, `-`, `@`, 탭, CR, LF뿐 아니라 일부 로케일에서 해석될 수 있는 전각 `＝`, `＋`, `－`, `＠`도 경고하며, OWASP ASVS v5.0.0-1.2.10은 NUL도 첫 필드 특수 문자로 포함합니다. 또한 어떤 단일 방식도 모든 스프레드시트와 재저장 동작에 보편적으로 안전하다고 가정해서는 안 됩니다.
**Prevention:** RFC 4180 방식으로 쉼표·따옴표·개행을 구조적으로 이스케이프하고, 문자열 필드의 첫 코드 포인트가 `=`, `+`, `-`, `@`, 탭, CR, LF, NUL 또는 전각 `＝`, `＋`, `－`, `＠`이면 단일 인용부호를 앞에 붙이는 ASVS 계약을 유지합니다. 실제 숫자 타입은 숫자 의미를 보존합니다. 새 export 경로가 생기면 공용 `csvField`를 재사용하고 `docs/doctoring/csv-formula-injection.md`의 상호운용성 한계와 회귀 테스트를 함께 갱신합니다.
