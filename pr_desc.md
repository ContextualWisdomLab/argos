🎯 **What:** Adds unit tests for the previously untested `truncateToolResponse` function in `packages/web/src/lib/server/events.ts`. This closes a testing gap for a small, pure string manipulation function.

📊 **Coverage:** Covered the following scenarios:
- Undefined input (returns undefined)
- Empty string input (returns undefined)
- String length exactly 2000 (returns original string)
- String length < 2000 (returns original string)
- String length > 2000 (returns truncated string of exactly 2000 characters)

✨ **Result:** Improved test coverage and reliability. Future refactors around payload truncations will be safe.
