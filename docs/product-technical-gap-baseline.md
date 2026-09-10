# Product–technical gap baseline

기준일: 2026-09-10

Argos의 session timeline은 관찰 데이터를 시간 순서로 결합해 사용자가 한 세션의 usage와 tool-call 흐름을 읽게 하는 Observability bounded context의 read model입니다. 정렬 최적화는 표시 순서와 누적 tool count라는 의미 계약을 바꾸지 않는 범위에서만 허용합니다.

## PR #610 — timestamp sort-key precomputation

`buildChartData`의 기존 구현은 `usageTimeline.sort` comparator 안에서 `Date.parse()`를 반복 호출하고, 정렬 뒤 다시 각 usage timestamp를 파싱합니다. 현재 변경은 usage마다 timestamp를 한 번 파싱해 wrapper에 보관하고 그 값을 정렬과 cumulative-tool merge에 재사용합니다. 소스 구조상 `Date.parse` 호출 횟수는 comparator 호출 횟수에 비례하던 형태에서 usage item 수에 비례하는 형태로 줄어듭니다.

다만 이것만으로 buyer-visible rendering latency, p95, main-thread blocking 또는 GC가 개선됐다고 판정하지 않습니다. 현재 PR에는 representative/right-cleared session workload와 동일 browser/runtime protected comparator, 반복 median/p95, allocation/GC 또는 main-thread profile이 없습니다. 따라서 이 변경은 **측정 전 bounded micro-optimization**으로만 취급합니다.

## 의미 계약과 acceptance

- timestamp 정렬 순서, 동일 timestamp의 상대 순서, invalid timestamp 처리, empty/single-item input, tool-call 누적 결과가 protected behavior와 같아야 합니다.
- 실제 buyer path에서 성능 개선을 주장하려면 representative session timeline으로 cold/warm 조건을 명시하고 동일 browser/runtime에서 protected base와 current head를 반복 비교합니다. median/p95와 main-thread/GC trace를 남깁니다.
- p95 20 ms 목표를 적용하는 buyer path라면 전체 chart-build/render 경계를 측정하며, sample 축소나 측정 구간 제외로 목표를 맞추지 않습니다.
- `.trivyignore` 또는 scanner suppression은 이 성능 변경의 일부가 아닙니다. PR에 섞여 있던 전역 CVE/GHSA suppression 파일은 base에 존재하지 않았고 근거·만료·영향 범위도 없으므로 제거했습니다. 실제 dependency finding은 dependency owner fix 또는 좁고 근거가 있는 별도 security decision으로 처리합니다.

## 결정

정렬 key precomputation 자체는 동작 동일성이 증명되는 한 유지할 수 있습니다. 반면 저장소 전체의 일반 성능 규칙으로 승격하거나 사용자 체감 향상을 주장하는 것은 benchmark 전에는 기각합니다. `.jules/bolt.md`는 protected base의 evidence-bounded 문구로 복원했습니다.

## 다음 조치

1. `buildChartData`의 order/cardinality/cumulative-count equivalence regression을 current head에 확보합니다.
2. representative session timeline에서 protected base 대 current head의 median/p95 및 main-thread/GC evidence를 수집합니다.
3. 동일 exact head의 CI, Security Scan, SAST, CodeQL과 current-head review가 terminal GREEN인 경우에만 Ready를 검토합니다.
