## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-08-11 - 핫 패스에서 Object.keys() 대신 for...in 사용하기

**Learning:** `Object.keys(obj)`는 키를 담은 새로운 배열을 할당하므로, 대규모 일별 롤업 데이터 병합이나 핫 패스에서 잦은 순회 시 불필요한 메모리 할당과 GC 오버헤드를 유발합니다.
**Action:** 반복마다 배열이 할당되는 것을 피하기 위해 `for (const k in obj)` 루프와 `if (Object.hasOwn(obj, k))`를 함께 사용하는 것을 권장합니다.
