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

## 2026-08-05 - [CRITICAL] ERD DDL 생성 시 SQL Injection 취약점
**Vulnerability:** ERD 모델의 DDL 생성 과정에서 사용자 입력값인 column type과 defaultValue가 검증 없이 SQL 문자열에 직접 연결되어 임의의 SQL이 실행될 수 있는 심각한 취약점이 발견됨.
**Learning:** 식별자(테이블명, 컬럼명)에 대한 정규식 검증은 존재했으나, type과 defaultValue와 같이 자유도가 높은 필드에 대한 입력값 검증이 누락되어 발생함. 자유 텍스트가 허용되는 입력이더라도 허용 목록 기반의 정규식 검증이 필수적임을 확인함. 한편, 지나치게 엄격한 정규식(예: `TIMESTAMP WITH TIME ZONE` 이나 `CURRENT_TIMESTAMP` 를 차단하는 등)은 기존 비즈니스 로직을 크게 훼손할 수 있으므로 보안과 가용성의 균형을 맞춘 유연한 Allowlist 검증이 중요함. 더불어 자기 참조 외래키(self-referencing FK)를 가진 컬럼을 지울 때 우회되어 무결성이 깨지는 버그도 함께 발견하여 수정함.
**Prevention:** 사용자가 제어하는 모든 값이 SQL 구문에 삽입될 때는 세미콜론이나 주석 등의 악의적인 문자가 포함되지 않도록 허용 가능한 패턴만 통과시키는 강력하면서도 범용성을 고려한 Allowlist 기반 검증 로직을 필수로 구현해야 함. 그리고 삭제나 갱신 로직을 작성할 때는 자기 자신을 우회하는 조건(`t.name !== tableName`)이 논리적 오류를 유발하지 않는지 꼼꼼히 점검해야 함.

## 2026-08-05 - [SAST False Positives Suppression]
**Vulnerability:** Semgrep 정적 분석 도구에서 안전한 내부 경로 연결(`path.join`) 및 URL(`urllib.request.urlopen`) 사용 시, 이를 취약한 Path Traversal 및 SSRF로 오탐(False Positive)하는 현상이 발생함.
**Learning:** 정적 분석 도구(SAST)는 사용자의 통제 하에 있지 않은(사용자 입력값에 의존하지 않는) 안전한 내부 로직에 대해서도 단순 함수 시그니처 매칭 기반으로 취약점을 잘못 탐지하여 CI를 실패하게 만들 수 있음을 파악함.
**Prevention:** 실제 취약점이 아님이 확인된 경우, 해당 코드 라인 위에 `nosemgrep` 주석을 추가하여 오탐을 명시적으로 무시 처리함으로써, 코드베이스를 깔끔하게 유지하고 CI 파이프라인의 불필요한 차단을 방지해야 함.