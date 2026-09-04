## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.
## 2024-05-24 - [핫 패스 객체 순회 최적화: for...in 활용]
**Learning:** Object.keys()나 Object.entries()는 배열을 할당하므로, 잦은 호출이나 대규모 데이터 집계 같은 핫 패스에서는 GC(Garbage Collection) 오버헤드를 발생시킵니다.
**Action:** 극단적인 성능 최적화가 필요한 핫 패스에서는 Object.keys() 대신 for...in 루프를 사용하고, 프로토타입 오염을 방지하기 위해 반드시 if (Object.hasOwn(obj, key))로 가드합니다.
