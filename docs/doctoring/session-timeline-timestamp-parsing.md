# Session timeline timestamp-parsing evidence

## Problem

`Array.prototype.sort` may invoke its comparison function repeatedly while ordering a collection. Parsing both timestamps inside that comparator therefore couples timestamp parsing cost to the number of comparisons rather than to the number of usage records.

## Decision

Create a local decorated usage array containing the original immutable record and one numeric `parsedTimestamp`, then sort by the numeric key. The existing forward merge with parsed tool events remains unchanged.

This produces the following bounded work:

- usage timestamp parsing: exactly `N` calls;
- tool timestamp parsing: exactly `M` calls in the existing memoized normalization;
- ordering: numeric comparison over local decorated arrays;
- input mutation: none;
- cumulative event merge: one forward pass after sorting.

The regression does not use a wall-clock threshold, which would be runner-dependent. It instruments `Date.parse` and proves each distinct usage timestamp is parsed exactly once, directly testing the removed source of repeated work.

## Standards traceability

ECMA-262 defines `Date.parse` as the standard string-to-time-value operation and defines `Array.prototype.sort` through implementation sorting with a supplied comparator. The specification does not promise a single comparator invocation per element, so an expensive parse must not be placed inside the comparator when a stable numeric key can be computed once.

## Reference

Ecma International. (2026). *ECMAScript 2026 language specification*. https://tc39.es/ecma262/2026/multipage/
