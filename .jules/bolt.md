## 2025-03-01 - [Virtualization Optimization in React-Window]
**Learning:** Performing string parsing (`new Date().getTime()`) directly within a `react-window` virtualized render loop function causes significant overhead during rapid scrolling due to frequent unmounting and remounting of `Row` components.
**Action:** Lift the static string parsing calculations outside the virtualized render loop (e.g., using `useMemo` in the parent container) and pass the pre-calculated numerical primitive down to the inner `Row` rendering components to drastically reduce frame drop latency.
