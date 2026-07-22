## 2024-05-24 - [Vitest Clipboard Mocking]
**Learning:** `navigator.clipboard.writeText` fails silently or times out in Vitest/jsdom without explicit mocking. Async `writeText` mock also requires `vi.useRealTimers()` in `afterEach` if `vi.useFakeTimers()` is used to prevent test timeouts.
**Action:** Always mock `navigator.clipboard` using `Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })` and wrap assertions on state changes triggered by clipboard actions in `waitFor` when testing React components.
