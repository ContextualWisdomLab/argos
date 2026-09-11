# Event-list timestamp parsing

## Decision

`EventList` is a virtualized list. Its `sessionStartedAt` prop is a single stable
anchor shared by every visible row, while each row has its own event timestamp.
The component now parses the shared anchor once with `useMemo` and passes the
resulting number through `react-window` row props. Row-specific timestamps remain
parsed only when a row is formatted.

Elapsed-time formatting is implemented in the pure `formatElapsedHms` utility so
invalid input, negative offsets, and hour/minute/second formatting can be tested
without rendering the virtualized component.

## Behavioral contract

- Standards-conforming ISO date-time strings are parsed with `Date.parse`.
- Unrecognizable or out-of-bounds timestamp strings yield `NaN` under the
  ECMAScript contract and render as an empty elapsed-time value.
- An invalid session anchor also renders an empty value.
- Events that precede the session anchor are clamped to `0:00:00`; UI time never
  moves backward.
- Durations longer than 24 hours retain the full hour count rather than wrapping.
- The optimization is not a semantic dependency: if React discards the memoized
  value, recomputation produces the same number.

## Performance boundary

The proven structural improvement is that parsing the shared session anchor is
no longer performed once per visible row render. It is performed when
`sessionStartedAt` changes. This document does not claim a universal speedup
ratio for `Date.parse` versus constructing a `Date`; engine, build mode, device,
and input shape affect microbenchmarks.

React documents `useMemo` as a performance optimization for caching a pure
calculation between renders while its dependencies remain unchanged. React may
recompute the value, so correctness must not depend on the cache. This design
follows that boundary.

ECMAScript specifies that `Date.parse` returns the UTC time value as a Number for
a recognized date-time string and returns `NaN` for unrecognizable or
out-of-bounds values. Inputs emitted by Argos APIs must remain in the repository's
ISO date-time contract; implementation-specific date formats are not accepted as
portable evidence.

## Verification

The focused regression suite covers:

- zero offset;
- hour, minute, and second formatting;
- pre-session events clamped to zero;
- invalid event timestamps;
- invalid session anchors; and
- the existing duration and formatting regression suite.

The exact pull-request head must also pass type checking, the complete web test
suite, coverage, production build, dependency review, SAST, and security checks.
A reproducible browser profiler or benchmark is required before making a numeric
latency or allocation-reduction claim.

## References

Ecma International. (2026). *ECMAScript language specification: Date.parse*
(Living specification, Section 21.4.3.2). Retrieved August 5, 2026, from
https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse

React. (n.d.). *useMemo*. Retrieved August 5, 2026, from
https://react.dev/reference/react/useMemo
