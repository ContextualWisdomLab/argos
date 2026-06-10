## 2024-05-24 - Flatten nested reduce for total calls computation in weekly report
**Learning:** `Object.values(r.agentCounts)` inside a `reduce` created unnecessary intermediate array allocations for every rollup, causing excess garbage collection and CPU cycles.
**Action:** Replaced nested `.reduce` and `Object.values()` iterations with a single loop over `thisWeekRollups` using `Object.keys()` to sum `totalAgentCalls` and `totalSkillCalls`, combined with collecting `distinctSkillsThisWeek`.
