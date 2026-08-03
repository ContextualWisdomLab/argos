## 2025-05-18 - [Performance] 문자열 타임스탬프 파싱 최적화
**Learning:** V8 엔진 등 JavaScript 환경에서 문자열로 된 타임스탬프를 밀리초 단위의 숫자로 변환할 때, `new Date(string).getTime()`을 사용하면 불필요한 Date 객체 할당(allocation)과 가비지 컬렉션 오버헤드가 발생한다. 특히 리렌더링이나 루프 등 성능에 민감한 핫 패스(hot path)에서는 이러한 오버헤드가 성능 저하의 원인이 될 수 있다.
**Action:** 단순히 타임스탬프 숫자 값(ms)만 필요한 경우, `new Date(string).getTime()` 대신 객체 생성 없이 바로 숫자를 반환하는 `Date.parse(string)`를 사용하도록 한다.
