
## 2025-02-12 - [의존성 패치 시 발생한 ESLint Minimatch 파손 이슈]
**Learning:** `pnpm.overrides`를 사용해 `brace-expansion`을 일괄 강제 업데이트하면, 하위 의존성(`minimatch` 및 `eslint-config-array`)이 파손되어 `eslint src` 명령어가 `TypeError: expand is not a function` 런타임 에러를 뿜으며 실패할 수 있습니다.
**Action:** 모든 하위 패키지에 글로벌 오버라이드를 적용하기 전에 주요 도구(`ESLint`, `build` 파이프라인 등)에 미치는 호환성을 테스트해야 하며, 필요 시 특정 메이저 버전(`brace-expansion@1.x`, `2.x`)별로 세분화하여 오버라이드를 적용하거나 문제가 되는 특정 패키지만 롤백해야 합니다.
