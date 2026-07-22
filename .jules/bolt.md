
## 2026-07-22 - [성능] 핫 패스에서 Object.entries 대신 Object.keys 사용
**Learning:** 데이터 집계 루프 등에서 Object.entries를 사용하면 각 키-값 쌍마다 중간 배열 튜플이 생성되어 GC 오버헤드가 증가합니다.
**Action:** 데이터 처리량이 많은 경로에서는 Object.entries를 피하고, Object.keys()를 사용하여 객체에서 직접 값을 가져와 불필요한 메모리 할당을 방지해야 합니다.
