
## 2025-02-12 - [CI/Trivy 취약점 수정 및 의존성 이슈]
**Vulnerability:** Github Actions trivy-fs 스캔 과정에서 `@auth/core`, `next`, `next-auth`, `postcss`, `sharp` 등에서 다수의 HIGH, CRITICAL 취약점이 발견되었습니다.
**Learning:** `pnpm` workspace 구조에서 `pnpm.overrides`를 이용해 하위 종속성을 일괄적으로 패치된 버전으로 올려야 하는 경우가 있습니다. 하지만 메이저 버전 차이 등을 고려하지 않고 강제로 덮어쓸 경우 `eslint`(`minimatch` 에러) 등 툴 체인이 깨질 수 있음을 확인했습니다.
**Prevention:** 의존성을 최신 버전으로 관리하되, `pnpm.overrides`로 강제 업데이트 시 빌드 및 린트 파이프라인의 호환성을 반드시 테스트하고 버전을 롤백하거나 세분화(`패키지@버전` 형식)하여 명시합니다.

## 2025-02-12 - [CI/Trivy 취약점 수정 및 의존성 파손 이슈]
**Vulnerability:** Github Actions trivy-fs 스캔 과정에서 `@auth/core`, `next`, `next-auth`, `postcss`, `sharp` 등에서 다수의 HIGH, CRITICAL 취약점이 발견되었습니다.
**Learning:** `pnpm` workspace 구조에서 `pnpm.overrides`를 이용해 하위 종속성을 일괄적으로 패치된 버전으로 올려야 하는 경우가 있습니다. 하지만 메이저 버전 차이 등을 고려하지 않고 강제로 덮어쓸 경우(예: `brace-expansion`을 5.x로 올릴 경우) 하위 의존성(`minimatch` 등)이 깨져서 `eslint` 명령어 실행 중 `TypeError: expand is not a function` 등 예상치 못한 빌드 런타임 에러가 발생할 수 있습니다.
**Prevention:** 의존성을 최신 버전으로 관리하되, `pnpm.overrides`로 강제 업데이트 시 빌드 및 린트 파이프라인의 호환성을 반드시 테스트하고 필요시 버전을 롤백하거나 메이저 버전에 맞춰 세분화(`패키지@버전` 형식)하여 명시적으로 제어해야 합니다.
