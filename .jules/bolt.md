## 2024-05-18 - [Recharts Optimization]
**Learning:** In Next.js components utilizing Recharts, transforming props data into chart-ready data points directly in the component body can cause significant performance bottlenecks due to expensive unnecessary recalculations on every React re-render. Some components have `useMemo` optimizations, but others are missing them.
**Action:** Always wrap data transformation logic (e.g., mapping arrays or reducing data arrays) within `useMemo` hooks before passing the result to Recharts components.
## 2024-05-18 - [EventList Rendering Optimization]
**Learning:** In a virtualized list component (e.g., `react-window` List), if a function executed on every row calculates a value based on a parent's constant prop (e.g., parsing a `Date` string), it creates a severe performance bottleneck during scrolling due to redundant string parsing on every render cycle.
**Action:** Always parse constant date strings or pre-calculate expensive parent-level constants using `useMemo` at the top level of the component and pass the computed primitive value (e.g., timestamp in milliseconds) down to the virtualized rows to eliminate repeated processing.
