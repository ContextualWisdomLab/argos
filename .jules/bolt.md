## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2024-09-24 - 불필요한 배열 할당 제거를 위한 for...in 활용

**Learning:** TypeScript/JavaScript 환경에서 큰 객체를 순회할 때 `Object.keys()`나 `Object.entries()`는 중간 배열을 생성하여 가비지 컬렉션(GC) 오버헤드를 유발합니다. 이 프로젝트에서처럼 매일 대량의 롤업 데이터를 처리하는 핫 패스(hot paths)의 경우, 이는 눈에 띄는 메모리 및 성능 병목 지점이 될 수 있습니다.

**Action:** 성능에 민감한 데이터 집계 로직에서는 `Object.keys()` 대신 `for...in` 반복문을 사용하고, 프로토타입 오염을 방지하기 위해 `if (Object.hasOwn(obj, key))` 가드를 추가하여 배열 할당을 원천적으로 차단합니다.
