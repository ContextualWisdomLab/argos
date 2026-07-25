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

## 2025-07-25 - [ERD 엔지니어링 도구 내 DDL 생성 시 SQL 인젝션 방지]
**Vulnerability:** ERD 도구(`packages/web/src/lib/erd.ts`)의 DDL 생성 기능에서, 컬럼 타입(`column.type`) 값에 대한 검증이 부족하여 사용자가 의도적으로 세미콜론(`;`) 등을 주입해 여러 개의 악의적인 SQL 문을 실행하도록 조작할 수 있었습니다 (예: `integer; DROP TABLE users;`).
**Learning:** 데이터베이스 스키마 생성 및 SQL을 동적으로 조립할 때 사용자 입력을 있는 그대로 연결(concatenate)하면 커맨드 인젝션 또는 SQL 인젝션 위험이 있습니다. 특히 DDL문에서는 Prepared Statement를 적용할 수 없는 경우가 많아, 입력값에 대한 명시적인 화이트리스트 기반의 검증이나 철저한 제한(세미콜론 차단 등)이 필수적입니다.
**Prevention:** 사용자로부터 제공되는 컬럼명이나 타입 정보에 구문 종료를 의미하는 세미콜론과 같은 메타 문자가 포함되지 않도록 추가적인 타입 검증(예: `column.type.includes(';')`)을 실시하여 DDL 생성 로직을 보호해야 합니다.
