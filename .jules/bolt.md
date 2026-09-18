## 2025-03-09 - [Schwartzian Transform Date.parse in Chart rendering]
**Learning:** Avoid repeatedly calling `Date.parse()` inside array `sort` comparators, as it results in O(N log N) parsing overhead which can be a performance bottleneck during frontend visualization of large datasets.
**Action:** Use a Schwartzian transform (decorate-sort-undecorate) to parse the timestamp strings just once per item (O(N)), sort the decorated objects by the pre-computed parsed timestamp, and then optionally reuse those computed timestamps in downstream pipeline operations instead of parsing them again.
