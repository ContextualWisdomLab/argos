
## 2026-05-14 - Pre-parsing Dates in Virtualized Lists
**Learning:** In highly dynamic virtualized lists (like `react-window`), performing `new Date(constantString).getTime()` inside the row rendering function causes O(N) redundant string parsing and garbage collection overhead. Even for constant values, this overhead becomes noticeable when N is large or scrolling is fast.
**Action:** Pre-parse constant dates (like `sessionStartedAt`) using `useMemo` at the list component level and pass the resulting primitive (`number` representing milliseconds) down to the row renderer.
