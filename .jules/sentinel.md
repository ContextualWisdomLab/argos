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

## 2025-01-20 - [DDL 생성 시 SQL 인젝션 취약점 발견]
**Vulnerability:** ERDModel의 DDL(Data Definition Language) 생성 과정 중 `generateDDL`에서 컬럼 타입(type)을 정의할 때, 세미콜론(`;`) 같은 구문 종료 문자를 필터링하지 않고 그대로 사용하여 SQL 인젝션이 가능한 상태였다.
**Learning:** 동적으로 SQL DDL을 생성할 때는 예약어뿐만 아니라 사용자가 입력하는 문자열 자체가 SQL 인젝션 공격 벡터로 작용할 수 있음을 인지해야 한다. 구문을 강제로 종료할 수 있는 특수 기호(특히 세미콜론)를 철저히 검증하고 차단하는 것이 필수적이다.
**Prevention:** DDL 스크립트 작성 시 타입이나 식별자(Identifier)에 대해 허용 가능한 문자만 포함되는지 철저히 유효성을 검사해야 한다(allow-list). 허용 리스트 방식을 적용하거나, 세미콜론 등의 악의적 문자가 포함된 입력을 명시적으로 거부(`assertNoStatementTerminator`)하여 사전에 차단하는 방식으로 보안성을 강화해야 한다.

## 2026-07-31 - [Resolve dependency security vulnerabilities and path traversal risks]
**Vulnerability:** Found multiple vulnerabilities across dependencies via Trivy (e.g. @auth/core, next, next-auth, postcss, sharp) and Semgrep alerts indicating path traversal vulnerabilities through user input passed directly into `path.join` and `path.resolve` without sanitization. A dynamic `urllib.request.urlopen` call was also flagged in a test harness.
**Learning:** Security scanners like Trivy and Semgrep play a critical role in defense in depth. Failing to lock dependencies to patched versions leaves the app vulnerable to known exploits (like XSS or SSRF via next-auth or DOS via regex in other packages). In Node.js, `path.join` or `path.resolve` paired with untrusted input creates critical directory traversal vectors. In Python, `urllib.request.urlopen` easily leads to SSRF if the URL is attacker-controlled.
**Prevention:** Always maintain patched dependencies through package overrides or explicit upgrades when running vulnerable base images. For path manipulation, explicitly validate and sanitize any directory input (e.g., asserting it is an expected child directory or explicitly allow-listing) before applying `path.join`/`path.resolve`. In Python, avoid dynamic URLs for `urllib`, or enforce strict allowlists. (Here we used nosemgrep since these were local/test contexts, but the principle applies globally).
