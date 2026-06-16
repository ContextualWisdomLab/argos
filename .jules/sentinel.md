
## 2024-05-18 - [CRITICAL] Fix Hardcoded Admin Password and Insecure Synchronous Hashing
**Vulnerability:** A hardcoded admin password (`ADMIN_PASSWORD`) was stored directly in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding credentials exposes sensitive access keys in source control, which leads to trivial unauthorized administrative access.
**Prevention:** Remove hardcoded credentials entirely. Rely instead on securely injected environment variables (e.g. `env.ADMIN_PASSWORD`) and validate these inputs via a robust schema like Zod (`env.ts`). Furthermore, when doing password hashing in API endpoints, ensure asynchronous hashing (like `pbkdf2` via `promisify`) is used to prevent single-threaded event loop blockage and Denial of Service (DoS) vectors, short-circuiting with cheap checks (like username matching) before triggering the expensive operations.
