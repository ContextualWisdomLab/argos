## 2026-08-11 - Use `Date.parse` for timestamp primitives

**Learning:** `Date.parse(value)` returns the timestamp primitive directly, while `new Date(value).getTime()` also constructs a `Date` object. Both use the same ECMAScript string-parsing semantics for these call sites.

**Action:** In frequently executed paths that only need a timestamp primitive, prefer `Date.parse(value)`. Treat the allocation reduction as a bounded micro-optimization unless a committed benchmark establishes a larger runtime effect.

## 2026-10-20 - 핫 패스에서 배열 할당을 피하기 위해 Object.keys() 대신 for...in 사용

**Learning:** `Object.keys()`는 메모리에 배열을 생성합니다. 큰 객체나 루프를 처리하는 핫 패스에서 배열 생성을 피하려면 `for...in`으로 직접 순회하면 가비지 컬렉션(GC) 오버헤드가 크게 줄어듭니다. 항상 프로토타입 오염을 방지하기 위해 `if (Object.hasOwn(obj, key))`로 보호해야 합니다.
**Action:** 핫 패스에서 객체를 순회할 때 불필요한 배열 할당을 방지하기 위해 `Object.keys()` 대신 보호된 `for...in` 루프를 사용합니다.
