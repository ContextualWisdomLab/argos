
## 2024-08-07 - Date 파싱 성능 최적화
**Learning:** V8 엔진에서 `new Date(string).getTime()`을 호출하면 불필요한 객체 할당(Object allocation)이 발생하여 파싱 속도가 저하됩니다. 루프나 빈번하게 호출되는 포맷팅 함수에서는 이 오버헤드가 누적되어 병목이 될 수 있습니다.
**Action:** 타임스탬프 문자열을 밀리초 단위 숫자로 변환할 때는 객체 생성을 피하고 `Date.parse(string)`을 우선적으로 사용해야 합니다.
