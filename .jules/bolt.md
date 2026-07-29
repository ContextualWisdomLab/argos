## 2024-05-15 - Optimize time-series Recharts component rendering
**Learning:** When refactoring nested array loops (O(N*M)) into pointer-based approaches (O(N+M)) where the original array order must be preserved, avoid using `Array.prototype.find()` or `.findIndex()` on the result to restore the order, as this introduces a hidden O(N^2) performance regression.
**Action:** Map and sort the original array indices, process the data with two pointers, and place the results back into a pre-allocated array at their original index positions.
