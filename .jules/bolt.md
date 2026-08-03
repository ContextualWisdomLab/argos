## 2025-02-12 - [TopUsersList 컴포넌트 성능 최적화]
**Learning:** React 함수형 컴포넌트에서 초기 데이터 배열이 빈 경우 early return 처리하는 패턴이 자주 사용되는데, 이 때 early return 구문 아래쪽에 값비싼 연산이나 `useMemo` 등의 훅(Hook)이 선언되면 React Hook Error가 발생할 수 있습니다.
**Action:** 항상 모든 React 훅은 최상단 (early return 조건문 이전)에서 선언하여 컴포넌트 렌더링 시 조건부로 실행되지 않도록 강제하며, 비용이 드는 연산에 대해서는 의존성 배열에 주의하여 `useMemo`로 캐시합니다. 빈 배열에 대한 `reduce` 처리는 초기값을 명시하여 에러를 피해야 합니다.
## 2026-07-13 - [테스트 모의 객체 타입 검증]
**Learning:** TypeScript 기반의 React 컴포넌트를 테스트할 때, 모의 객체(Mock)가 컴포넌트의 Props 인터페이스(예: `UserStat`)에 정의된 모든 필수 속성들을 누락 없이 포함해야 타입 에러가 발생하지 않습니다. CI 환경에서의 타입 체크는 이러한 누락을 엄격하게 검증합니다.
**Action:** 향후 테스트 코드 작성 시 컴포넌트의 Props 타입을 정확히 확인하고, 모의 객체 생성 시 필수 속성들(예: `skillCalls`, `agentCalls` 등)을 모두 포함하여 타입 에러가 발생하지 않도록 주의합니다.
## 2026-07-13 - [보안 취약점과 의존성 강제 업데이트 패턴]
**Learning:** `pnpm` 환경에서 깊숙이 중첩된 하위 패키지의 보안 취약점(예: `brace-expansion`)을 임시로 해결해야 할 때, 직접 의존성이 아니더라도 `package.json`의 `pnpm.overrides`를 활용하면 버전 충돌을 강제로 해결하여 CI 스캐너 오류를 우회할 수 있습니다.
**Action:** 향후 유사한 OSV 취약점 관련 CI 에러 발생 시, `pnpm why`로 원인을 파악한 뒤 `package.json`의 `pnpm.overrides` 필드를 업데이트하는 방식을 고려해야 합니다.
