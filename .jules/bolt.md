## 2026-07-27 - Optimize SessionTimelineChart
**Learning:** Nested filtering in Recharts data preparation creates severe O(N*M) bottlenecks during React rendering, causing main thread blocking.
**Action:** Always sort timeline data and use O(N+M) two-pointer algorithms when aggregating chronologically related arrays in charts.
## 2026-07-27 - Fix Trivy Vulnerabilities & React Hook errors
**Learning:** Hard-fixing versions in `pnpm.overrides` blocks normal updates, creating stubborn `Trivy` alerts for sub-dependencies. React hook state updates (`setState`) must not be placed directly in the main body of a `useEffect` if they trigger synchronously during the render cycle; this causes cascading re-renders and ESLint failures.
**Action:** Always check the root `package.json` overrides field when `pnpm up -r` fails to update nested dependencies, and remove overrides preventing the latest security patches. Migrate modal form state resets from `useEffect` into the `onOpenChange` handlers.
