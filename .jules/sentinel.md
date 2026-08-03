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

## 2025-08-04 - [DDL 생성 시 SQL 인젝션 방지]
**Vulnerability:** ERD 도구에서 DDL을 생성할 때, 컬럼 타입 문자열에 세미콜론(;)을 포함시켜 기존 문장을 종료하고 악의적인 SQL 문(예: `DROP TABLE`)을 삽입할 수 있는 SQL 인젝션 취약점이 존재했습니다.
**Learning:** 사용자 입력(이 경우 컬럼 타입)을 직접 연결하여 SQL 쿼리나 DDL을 생성하는 경우, 구문 종결자(Statement Terminator)를 필터링하지 않으면 데이터베이스 조작으로 이어질 수 있습니다.
**Prevention:** DDL과 같은 동적 쿼리를 생성할 때 구문 종결자가 입력에 포함되어 있는지 확인(`assertNoStatementTerminator`)하여 악의적인 SQL 문 실행을 사전에 차단해야 합니다.

## 2025-08-04 - [ERD 모델의 심화 SQL 인젝션 및 상태 조작 방지]
**Vulnerability:** 기존의 세미콜론 검사만으로는 SQL 주석(`--`, `/*`)이나 `UNION` 공격을 통한 SQL 인젝션을 막을 수 없었으며, `getTable()` 등을 통해 내부 상태 객체가 참조로 반환되어 유효성 검사 이후에 임의로 악성 SQL을 주입(Prototype Pollution/State Manipulation)할 수 있는 취약점이 있었습니다.
**Learning:** 내부 상태를 외부로 노출할 때 참조형 객체를 그대로 반환하면 외부에서 상태를 조작하여 모든 내부 보안 검증을 우회할 수 있습니다. 또한 SQL 인젝션은 세미콜론 외에도 주석 및 예약어(UNION 등)를 이용한 공격 경로가 존재합니다.
**Prevention:** 컬럼 타입과 같은 사용자 입력은 엄격한 화이트리스트나 상세한 차단 목록(주석, UNION 등)으로 검증해야 하며, 객체 상태를 반환할 때는 복사본(예: 깊은 복사 `JSON.parse(JSON.stringify(obj))`)을 반환하여 내부 맵이나 속성을 직접 조작할 수 없도록 격리해야 합니다.
