## 2023-10-27 - [Timestamp Sorting Optimization]
**Learning:** ISO 8601 string representations of date/time (e.g. "2023-01-01T00:00:00.000Z") can be accurately and significantly faster sorted using standard string comparison `a < b ? -1 : a > b ? 1 : 0` rather than `Date.parse(a) - Date.parse(b)`. Doing Date parsing inside a `.sort()` comparator loop causes severe overhead because the parser gets called O(n log n) times.
**Action:** When sorting arrays of objects by ISO timestamp in this codebase, immediately use direct string comparison instead of `Date.parse()`.
