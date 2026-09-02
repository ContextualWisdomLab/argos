## 2024-05-15 - [O(N log N) Date Parsing Bottleneck in Array Sort]
**Learning:** Parsing dates inside `Array.prototype.sort()` comparators creates a significant O(N log N) performance bottleneck, as dates are re-parsed multiple times per element during the sort operation.
**Action:** Use a Schwartzian transform (mapping the array first to include the parsed value) to pre-parse dates in a single O(N) pass before sorting the dataset.
