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
## 2026-08-27 - 🛡️ Fix deepmerge-ts vulnerability (CVE-2026-40345)
**Vulnerability:** OSV-Scanner detected a High severity vulnerability (CVE-2026-40345) in `deepmerge-ts` v7.1.5 via a GitHub CI check suite failure.
**Learning:** CI 파이프라인에서 트리비/OSV-Scanner가 하위 종속성에 있는 취약점을 발견하면, 최상단 `package.json`의 `pnpm.overrides` 필드를 사용하여 안전한 버전(v8.0.0)으로 덮어쓰고 강제로 패치할 수 있습니다.
**Prevention:** 향후 심층 종속성 취약점 보고서를 해결할 때도 동일하게 `pnpm.overrides`를 활용하여 버전을 고정하고, `pnpm install`을 실행하여 `pnpm-lock.yaml`을 갱신합니다.
## 2026-09-28 - 🛡️ Fix multiple subdependency vulnerabilities (CVE-2026-45819, CVE-2026-73088, CVE-2026-73089, CVE-2026-75604, GHSA-2xp9-vwfh-vxw4, GHSA-rgj7-g3m4-5g8c)
**Vulnerability:** OSV-Scanner detected multiple Critical and High severity vulnerabilities in `baseline-browser-mapping`, `browserslist`, `next`, and `sharp` via a GitHub CI check suite failure.
**Learning:** 여러 하위 종속성(subdependencies)에서 취약점이 발생할 경우, 각 패키지의 안전한 버전으로 `pnpm.overrides` 필드를 구성하여 동시에 패치해야 합니다.
**Prevention:** 정기적으로 Trivy/OSV-Scanner 경고를 모니터링하고, 발견된 취약점들은 `package.json`의 `pnpm.overrides`에 버전을 고정시킨 뒤 락파일(`pnpm-lock.yaml`)을 갱신하여 사전에 방지합니다.
## 2026-09-30 - 🛡️ Fix multiple subdependency vulnerabilities including next, browserslist, streamsearch, busboy
**Vulnerability:** OSV-Scanner and Dependency Review detected multiple Critical and High severity vulnerabilities in `next` (GHSA-2xp9-vwfh-vxw4, CVE-2025-29927, CVE-2025-55182), `browserslist` (CVE-2026-73088, CVE-2026-73089), `streamsearch` and `busboy` via a GitHub CI check suite failure.
**Learning:** 여러 하위 종속성에서 취약점이 추가로 발견되거나 dependency review 단계에서 스코어카드가 낮은 패키지가 발견되는 경우, 동일한 패턴(`pnpm.overrides`)을 적용하여 안전한 버전(e.g., next: 15.5.24, browserslist: 4.28.7, streamsearch: 1.1.0, busboy: 1.6.0)으로 모두 패치해야 합니다.
**Prevention:** 정기적으로 Trivy/OSV-Scanner 경고 및 Dependency Review를 확인하고, 발견된 취약점들은 `package.json`의 `pnpm.overrides`에 버전을 고정시킨 뒤 락파일(`pnpm-lock.yaml`)을 업데이트하여 해결합니다.
