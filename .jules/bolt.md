## 2024-05-24 - React 차트에서의 V8 Date 파싱 오버헤드
**Learning:** 성능이 중요한 경로(예: 차트를 위한 배열 정렬, 배열 매핑)에서 ISO 문자열을 타임스탬프로 파싱할 때, `new Date(string).getTime()`을 사용하면 불필요한 객체 할당이 발생하여 병목 현상이 될 수 있습니다.
**Action:** V8에서 파싱 속도를 크게 향상시키고 불필요한 객체 할당을 방지하려면 루프나 성능이 중요한 경로에서 `new Date(string).getTime()` 대신 항상 `Date.parse(string)`을 사용하는 것이 좋습니다.
