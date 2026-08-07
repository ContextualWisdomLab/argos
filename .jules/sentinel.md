## 2024-05-30 - Fix Path Traversal Vulnerability
**Vulnerability:** Path traversal via `path.join` in `project.ts`.
**Learning:** `Strix` security bot caught an unvalidated path being passed to `writeProjectConfig()`. The `startDir` inputs were not fully sanitized or restricted to the working directory.
**Prevention:** Sanitize inputs with `path.normalize()` and prevent relative path manipulation or traversing up the directory tree in the future.
