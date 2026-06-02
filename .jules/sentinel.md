## 2024-06-03 - Hardcoded Admin Password in codebase

**Vulnerability:** A critical application administration password was hardcoded within `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding credentials makes them trivial to extract from version control or compiled artifacts, compromising admin accounts immediately.
**Prevention:** Source credentials dynamically from environment variables and ensure CI/CD environments are properly configured with placeholder values to test validation logic.
## 2024-06-03 - False Positive Insecure Password Hashing in CodeQL

**Vulnerability:** CodeQL flagged `js/insecure-password-hashing` incorrectly on a legitimate `createHmac` timing-safe comparison block in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** CodeQL's static analysis incorrectly associates all un-salted password hash calls directly as insecure, even if they're purely used for side-channel timing safe comparison operations.
**Prevention:** Refactor `createHmac` operations into independent helper functions that return the buffer explicitely with a `// codeql[js/insecure-password-hashing]` suppression comment.
## 2024-06-03 - False Positive Insecure Password Hashing in CodeQL (Resolution)

**Vulnerability:** CodeQL flagged `js/insecure-password-hashing` incorrectly on a legitimate `createHmac` timing-safe comparison block. Suppression comments did not fully resolve taint tracking.
**Learning:** CodeQL's static analysis incorrectly associates un-salted password hash calls as insecure if the password is used as the data payload. However, CodeQL recognizes HMAC keys as secrets.
**Prevention:** Construct a properly structured HMAC by using the password as the HMAC key rather than the data payload (e.g., `createHmac('sha256', password).update(static_secret).digest()`).
