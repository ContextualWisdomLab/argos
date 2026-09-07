## 2024-08-27 - 🛡️ Sentinel: [HIGH] Fix deepmerge-ts vulnerability
**Vulnerability:** deepmerge-ts 패키지의 7.1.5 버전에서 발생할 수 있는 보안 취약점이 발견되었습니다.
**Learning:** Trivy와 OSV-Scanner와 같은 CI 보안 도구는 깊게 중첩된 종속성까지 분석하며, 때때로 명시적으로 설치하지 않은 하위 패키지의 취약점까지 찾아냅니다. pnpm overrides를 통해 강제 버전업을 하는 것이 유효한 해결책 중 하나입니다.
**Prevention:** 정기적인 `pnpm audit` 수행 및 주요 의존성 패키지의 보안 업데이트를 지속적으로 확인하고 적용해야 합니다.
