## 2025-06-06 - [CRITICAL] Fix hardcoded admin password
**Vulnerability:** A hardcoded admin password (`og9oRajx7h88v1RIj3eDgdrh9jgLYVV3`) was present in `packages/web/src/lib/server/admin-auth.ts`, exposing the admin credentials in the source code.
**Learning:** Hardcoded credentials can easily be checked into version control and compromise security. They should be loaded via environment variables and validated at runtime using tools like `zod`.
**Prevention:** Use environment variables for all secrets, ensure they are validated by the configuration loader (e.g. `env.ts`), and maintain proper `.env.example` templates and CI placeholder values so developers and automation understand the requirements.

## 2025-06-06 - [CRITICAL] Fix CodeQL Insecure Password Hashing Alert
**Vulnerability:** `verifyAdminCredentials` used `createHmac` to verify passwords via `safeEqual`, which triggered a CodeQL alert for insecure password hashing (js/insecure-password-hashing). Custom 'homebrew' buffer-padding or direct HMAC was vulnerable to timing attacks.
**Learning:** When fixing CodeQL alerts for insecure password hashing, standard HMAC-based comparisons should not be used for direct password validation. Instead, use an established cryptographic method like pbkdf2. To prevent blocking the Node.js event loop during API requests, use the asynchronous `crypto.pbkdf2` via `util.promisify`. For target hash, use `pbkdf2Sync` pre-computed at module initialization.
**Prevention:** Rely on established cryptographic methods like pbkdf2 and ensure they are executed asynchronously in route handlers to avoid Denial of Service vulnerabilities.
