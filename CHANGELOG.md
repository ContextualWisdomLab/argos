# 변경 사항

## ⚡ 성능 최적화: Recharts 컴포넌트 내 data mapping을 useMemo로 캐싱

### 대상 컴포넌트
- `packages/web/src/components/dashboard/daily-work-chart.tsx`
- `packages/web/src/components/dashboard/daily-cache-reads-chart.tsx`
- `packages/web/src/components/dashboard/model-share-chart.tsx`
- `packages/web/src/components/dashboard/skill-frequency-chart.tsx`

### 변경 내용
- Recharts는 배열 참조가 바뀔 때마다 내부적으로 값비싼 렌더링 작업을 수행합니다.
- 이에 따라 Recharts 시각화 컴포넌트들이 불필요하게 재렌더링되는 문제를 방지하기 위해, 데이터 변환 연산과 변환된 배열을 `useMemo` 훅을 사용해 메모이제이션 하였습니다.

### 기대 효과
- Dashboard 페이지 내 React Re-render 횟수가 감소하여 메모리 사용량이 개선되고 성능 측정 지표가 향상됩니다.
