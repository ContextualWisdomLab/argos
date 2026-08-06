# Session timeline cumulative merge contract

## Decision

`SessionTimelineChart` derives each rendered bar from two caller-owned event streams:
usage samples and tool messages. The component now treats both inputs as immutable,
sorts local copies by timestamp, and advances one tool-event cursor across the
chronological usage sequence. Each bar therefore contains every tool call whose
timestamp is less than or equal to that bar's timestamp.

This preserves the product meaning of a timeline tooltip: it reports cumulative
activity up to the selected point. An interval-only summary would incorrectly make
earlier tool use disappear from later bars.

## Complexity and claim boundary

For `N` usage samples and `M` tool calls, local sorting costs
`O(N log N + M log M)`. The chronological merge after sorting is `O(N + M)`.
Formatting each tooltip also depends on the number of distinct cumulative tool
names because the visible top three are ranked by count. The implementation does
not claim a universal wall-clock speedup without production profiling.

The previous implementation repeatedly filtered all tool calls for every usage
sample, allocating an intermediate array per bar. The replacement avoids that
nested scan and writes one chart row per usage sample.

## React boundary

React documents `useMemo` as a performance optimization that caches a pure
calculation while its dependencies remain equal. It is not a semantic guarantee.
The timeline therefore remains correct when React recomputes or discards the
memoized value. Cursor and count mutation live only inside the pure module-level
builder, never in caller props or long-lived React state.

The dependency list includes the usage stream, normalized tool stream, and session
start. The tool stream itself is memoized from `messages`. Local array copies are
sorted so the caller's ordering and object identities remain unchanged.

## Deterministic ordering

Tool names are stored in first-observed chronological order. Count ranking uses
ECMAScript's stable array sort, so equal-count tools retain that first-observed
order. The displayed summary is bounded to three names; additional distinct tools
are represented by a finite `+N more` suffix.

## Verification contract

The product-level component tests prove:

1. an empty usage stream renders the established empty state;
2. a usage stream without tool calls emits an empty summary;
3. a tool used before the first bar remains present after a later tool call;
4. unsorted caller inputs are rendered chronologically without mutation;
5. repeated calls produce an `xN` count;
6. equal-count names retain first-observed order;
7. more than three distinct names produce a bounded remainder count; and
8. an empty tool name is represented by the fixed `unknown` label.

Repository CI must pass the complete web test suite, type checking, lint, production
build, dependency review, OSV scanning, security scanning, and Semgrep on the exact
pull-request head. The merge still requires current-head automated review and a
qualifying independent approval.

## References

Ecma International. (2026, July 17). *ECMAScript 2027 language specification*
(Draft ECMA-262). TC39. https://tc39.es/ecma262/

React. (n.d.). *useMemo*. Retrieved August 5, 2026, from
https://react.dev/reference/react/useMemo
