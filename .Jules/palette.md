## 2025-06-25 - React Toggle Aria Controls Implementation
**Learning:** When adding `aria-controls` to visually hidden/collapsible UI elements (like `ContextSection` content) in a React application with multiple instances on screen, static string IDs create collisions that break accessibility tools.
**Action:** Always prefer React's `useId()` hook over static strings or arbitrary counters when generating unique, stable element relationships (such as `aria-controls={id}` / `id={id}`) to guarantee correct semantics regardless of component usage.
