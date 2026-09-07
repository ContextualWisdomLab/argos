## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-08-14 - 단일 데이터셋에서 여러 파생 배열 생성 시 필터와 맵 연쇄 호출의 비효율성
**Learning:** 단일 배열 데이터셋에서 여러 개의 파생 데이터를 추출할 때 `.filter().map()` 체인을 여러 번 분리해서 사용하면 데이터 순회가 O(K * N)으로 증가하고 불필요한 중간 배열 할당에 따른 가비지 컬렉션(GC) 오버헤드가 커진다는 것을 발견함.
**Action:** 동일 데이터셋에서 여러 파생 배열을 생성해야 할 때는 `.filter()`와 `.map()`을 연쇄하지 말고, 단일 `for...of` 루프를 사용해 O(N)으로 통합 처리하여 메모리 할당 및 순회 오버헤드를 최소화할 것.
