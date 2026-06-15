
## 2024-05-18 - [CRITICAL] Prevent Hardcoded Passwords and Synchronous Event Loop Blocking

**Vulnerability:** The application contained a hardcoded plaintext admin password in `packages/web/src/lib/server/admin-auth.ts`. Furthermore, comparing incoming passwords directly using synchronous functions on every request could block the Node.js event loop and lead to a Denial of Service (DoS).

**Learning:** Hardcoding credentials makes them difficult to rotate and exposes them directly to anyone with source code access. In addition, when resolving CodeQL `js/insecure-password-hashing` alerts or handling credential checks, fast hashing techniques or synchronous comparisons can introduce security risks (like offline brute-forcing and DoS).

**Prevention:** Always use environment variables for sensitive credentials (e.g. `env.ADMIN_PASSWORD`). Securely pre-compute target hashes using `pbkdf2Sync` during module initialization to avoid storing plaintext in memory long-term. In request handlers, ensure the password input hash calculation is asynchronous by using `util.promisify(crypto.pbkdf2)` and apply `timingSafeEqual()` against the pre-computed hash. To further prevent CPU exhaustion from malicious users, perform cheap checks (like short-circuiting on an incorrect username) before executing CPU-intensive algorithms (PBKDF2).
