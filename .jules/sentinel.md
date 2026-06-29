## 2025-05-14 - [보안 헤더 설정 (Security Headers)]
**Vulnerability:** Next.js 애플리케이션에 X-Frame-Options, X-Content-Type-Options 등의 기본 보안 헤더가 설정되어 있지 않았음.
**Learning:** `next.config.ts` 파일에 `headers()` 설정을 통해 전역으로 쉽게 적용이 가능함을 배움.
**Prevention:** 향후 새로운 Next.js 프로젝트 설정 시 `next.config.ts` 또는 `next.config.mjs`에 기본 보안 헤더(XSS, MIME sniffing 방어, Clickjacking 방어 등)를 필수적으로 포함시킬 것.
