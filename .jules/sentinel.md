## 2024-05-24 - Command Injection via Unsanitized URL
 **Vulnerability:** Unsanitized URL was passed directly to the `child_process.exec()` function in `packages/cli/src/lib/auth-flow.ts`, opening the application up to potential command injection.
 **Learning:** Never pass unsanitized user inputs to functions that execute shell commands like `exec`. Using `child_process.execFile` or dedicated packages like `open` is safer.
 **Prevention:** Use secure alternatives for launching files or URLs. In this case, use the `open` library, which safely opens files or URLs using the operating system's default applications.
