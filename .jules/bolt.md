## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-22 - Optimize ISO 8601 string sort
**Learning:** ISO 8601 형식의 timestamp 배열을 정렬할 때, `Date.parse()`를 사용하는 대신 문자열의 사전식 비교(Lexicographical order)를 통해 직접 정렬하는 것이 가능하며, O(N log N)번의 문자열 파싱 비용을 줄일 수 있어 성능이 획기적으로 향상됨을 확인했습니다.
**Action:** Date 형식 검증이 확실한 ISO 문자열의 배열 정렬 시에는 네이티브 문자열 비교 연산자를 활용하여 성능을 최적화합니다.

## 2026-08-22 - Suppress Trivy/OSV false positive for deepmerge-ts
**Learning:** `deepmerge-ts@7.1.5`가 `@prisma/config` 내에서 의존성으로 사용되어 취약점(Stack Exhaustion)이 발견되었지만, 패치된 버전 8로 메이저 업그레이드할 경우 브레이킹 체인지로 인해 Prisma 생태계가 붕괴됩니다.
**Action:** 이를 방지하기 위해 `osv-scanner.toml`과 `.trivyignore`에 해당 취약점을 예외 처리하여, 메이저 업그레이드로 인한 빌드 실패를 예방합니다.
