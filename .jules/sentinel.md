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
## 2026-09-03 - [Fix vulnerable dependencies via pnpm overrides (OSV-Scanner)]
**Vulnerability:** OSV-Scanner를 통해 `@humanfs/node`, `browserslist`, `deepmerge-ts`, `fast-uri`, `postcss-selector-parser`, `qs` 패키지에서 알려진 취약점이 발견되었습니다 (GHSA-p498-v437-472g, GHSA-73wf-gq98-2v4g 등).
**Learning:** 깊게 중첩된 의존성 패키지들(transitive dependencies)에서 발견된 취약점은 애플리케이션 전체에 위험을 초래할 수 있으므로, 주기적인 의존성 스캔 및 버전 강제가 필수적입니다.
**Prevention:** 루트 `package.json`의 `pnpm.overrides` 블록을 활용하여 취약점이 패치된 안전한 버전으로 강제 업데이트(`pnpm install` 포함)함으로써 모든 의존성 경로에 대해 일관되게 방어할 수 있습니다.
## 2026-09-04 - [Trivy scan OSV mitigation via PR base update]
**Vulnerability:** OSV-Scanner discovered vulnerable transitive dependencies, but applying fixes in `pnpm.overrides` directly on an active PR triggered out-of-scope Trivy check failures (`trivy-fs`) because Trivy checks are restricted to PR-changed files or base branch state logic.
**Learning:** Fixing global package dependencies within a feature or isolated bug fix branch can cause CI scanners like Trivy to fail if the PR is expected to only touch codebase logic, or if the dependency update modifies the entire lockfile scope triggering unrelated check constraints.
**Prevention:** Global dependency updates (like `pnpm.overrides`) should ideally be separated into a dedicated PR or applied directly on the base branch first. In this PR, I have isolated the code exclusively to the CSV Formula Injection fix and reverted the `package.json` updates to pass the isolated CI scopes, ensuring the code-level CSV vulnerability is addressed immediately.
## 2026-09-05 - CI Blockers Overriding Deprecated Packages via pnpm overrides
**Vulnerability:** OSV-Scanner and Trivy blocked CI due to high-severity vulnerabilities in deeply nested dependencies: `browserslist` (CVE-2026-73088, CVE-2026-73089) and `deepmerge-ts` (CVE-2026-40345).
**Learning:** These scanners evaluate the global `pnpm-lock.yaml`, meaning that vulnerabilities in transitive dev dependencies break the build, even if they aren't part of our primary product logic.
**Prevention:** Rather than directly modifying the lockfile or hoping for upstream updates, explicitly override these nested dependencies to patched, secure versions via the `pnpm.overrides` field in the root `package.json`, then run `pnpm install` to propagate the patches to the lockfile.
## 2026-09-05 - CI Blockers Overriding Deprecated Packages via pnpm overrides (part 2)
**Vulnerability:** OSV-Scanner blocked CI again due to high-severity vulnerabilities in additional nested dependencies: `@humanfs/node` (CVE-2026-73090, GHSA-p498-v437-472g), `fast-uri` (GHSA-5jgf-p345-68v8, GHSA-f65p-4m7j-42xc, GHSA-fph4-wmhf-6fwf, GHSA-jqff-g426-hqxp), `postcss-selector-parser` (GHSA-w9m9-85wc-3x92), and `qs` (GHSA-4mjr-xmp4-gh2g, GHSA-x5fp-wj9c-mxmx).
**Learning:** These scanners evaluate the global `pnpm-lock.yaml`, meaning that vulnerabilities in transitive dev dependencies break the build, even if they aren't part of our primary product logic.
**Prevention:** Rather than directly modifying the lockfile or hoping for upstream updates, explicitly override these nested dependencies to patched, secure versions via the `pnpm.overrides` field in the root `package.json`, then run `pnpm install` to propagate the patches to the lockfile.
## 2026-09-05 - Restricting Global Workflow Permissions
**Vulnerability:** CI Scorecard checks failed because GitHub Actions workflows (`dependency-review.yml` and `osvscanner.yml`) either lacked global top-level permission restrictions or incorrectly elevated global top-level permissions (`security-events: write`).
**Learning:** Workflows must adhere to the principle of least privilege. Top-level permissions should be restricted globally (e.g., `contents: read`), and elevated permissions (like `security-events: write`) must be scoped strictly down to the specific job that requires them.
**Prevention:** Always declare `permissions: contents: read` at the top level of `.github/workflows/*.yml` files. Move any required elevated permissions into the individual `jobs.<job-name>.permissions` block.
