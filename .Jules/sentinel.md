## 2024-03-21 - Host Header Injection 방지를 위한 절대 경로 구성
**Vulnerability:** `req.nextUrl.origin`을 사용하여 동적으로 URL(비밀번호 초기화 링크, CLI 인증 링크 등)을 생성하는 코드에서 Host Header Injection 취약점 발견.
**Learning:** Next.js 라우트나 미들웨어에서 `req.nextUrl.origin` (또는 `headers.get('host')`)에 의존하면 악의적인 사용자가 변조된 Host 헤더를 통해 잘못된 도메인으로 콜백을 유도할 수 있음. 특히 인증 콜백과 관련된 URL에서는 이러한 취약점이 크리티컬함.
**Prevention:** 인증 콜백, 이메일 링크 등 민감한 절대 경로 URL을 생성할 때는 항상 신뢰할 수 있는 환경 변수(예: `process.env.NEXT_PUBLIC_SITE_URL`)를 우선적으로 사용하여 정적으로 정의된 안전한 도메인을 보장해야 함.