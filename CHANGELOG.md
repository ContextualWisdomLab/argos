# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- `.jules/bolt.md`에 `Array.prototype.sort()` 시 `Date.parse()` 중복 호출로 인한 성능 저하 및 Schwartzian transform을 활용한 해결 패턴을 기록했습니다.
- `session-timeline-chart.test.tsx`에 새로 최적화된 Schwartzian transform 기반 정렬 로직이 정상 작동하는지 검증하는 단위 테스트를 추가했습니다. (테스트 커버리지 보완)

### Changed
- `session-timeline-chart.tsx`에서 O(N log N) 횟수만큼 반복되던 `Date.parse()` 연산을 Schwartzian transform (decorate-sort-undecorate) 기법을 사용하여 단일 O(N) 패스로 최적화했습니다. 정렬 후 이어진 렌더링 루프에서도 캐싱된 파싱 결과를 재사용하여 불필요한 연산을 완전히 제거했습니다.
