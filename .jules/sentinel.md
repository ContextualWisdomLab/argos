## 2026-06-08 - [Hardcoded Admin Password]
**Vulnerability:** Hardcoded `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `packages/web/src/lib/server/admin-auth.ts` could allow unauthorized access if source code is exposed.
**Learning:** Hardcoding credentials makes the application insecure and inflexible, and prevents credential rotation without code deployment.
**Prevention:** Use environment variables validated via schema (e.g., Zod) for all credentials and API keys. Keep default values secure and avoid committing secrets.

## 2026-06-08 - [Insecure Password Hashing]
**Vulnerability:** Fast hash (HMAC-SHA256) was used for timing-safe equality checks of passwords, which triggered a CodeQL `js/insecure-password-hashing` alert.
**Learning:** Using simple HMACs for passwords is not enough against offline dictionary attacks if the secret is known or short. CodeQL expects a proper key derivation function (like `pbkdf2`) for passwords. Furthermore, sync versions of KDFs (like `pbkdf2Sync`) should not be used in request paths as they block the event loop and cause DoS.
**Prevention:** Precompute target hashes at module initialization using `pbkdf2Sync`, and use the asynchronous `crypto.pbkdf2` (via `util.promisify`) for hashing incoming passwords within request handlers.
