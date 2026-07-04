## 2024-07-04 - [Host Header Injection in API Routes]
**Vulnerability:** 애플리케이션이 민감한 작업(비밀번호 재설정 링크 및 CLI 인증 콜백)의 절대 URL을 구성할 때 `req.nextUrl.origin`을 사용하고 있었습니다. 이는 공격자가 Host 헤더를 조작하여 공격자가 제어하는 도메인을 가리키는 링크를 생성할 수 있게 합니다.
**Learning:** `req.nextUrl.origin`은 수신된 HTTP 요청의 Host 헤더에서 동적으로 origin을 유추합니다. 이메일, 콜백 또는 리디렉션을 위한 절대 URL을 생성할 때 이를 절대 신뢰해서는 안 됩니다.
**Prevention:** 클라이언트가 제공한 Host 헤더에 의존하는 대신, 정적으로 구성된 서버 측 환경 변수(예: `process.env.NEXT_PUBLIC_SITE_URL`)를 절대 URL의 기본값으로 항상 사용해야 합니다.
