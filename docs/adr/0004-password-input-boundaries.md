# ADR 0004: Password input resource and bcrypt byte boundaries

- **Status:** Accepted
- **Date:** 2026-08-06
- **Decision owners:** Argos maintainers
- **Applies to:** `@argos/shared`, `@argos/web`, and external module consumers of authentication services

## Context

Authentication endpoints accept attacker-controlled strings immediately before database lookup and password hashing. A request-level ceiling is required to prevent unbounded payload processing. The current password storage implementation also uses `bcryptjs`; bcrypt verifies at most 72 UTF-8 bytes and silently truncates longer inputs unless the application rejects them.

NIST SP 800-63B recommends permitting at least 64 characters and verifying the complete submitted password. OWASP recommends a maximum input length to reduce denial-of-service risk, identifies bcrypt as a legacy choice, and requires a 72-byte maximum while bcrypt remains in use. These requirements create a temporary compatibility constraint until Argos migrates stored password hashes to Argon2id or scrypt.

## Decision

1. `MAX_PASSWORD_LENGTH = 1024` is the general request-resource ceiling. It applies to credential inputs that do not use bcrypt, including administrator credential verification backed by uniform SHA-256 comparison.
2. User passwords that reach the legacy bcrypt storage layer use the stricter `BCRYPT_MAX_PASSWORD_BYTES = 72` boundary.
3. The bcrypt boundary is calculated from UTF-8 bytes with `TextEncoder`, not JavaScript code-unit count. This prevents silent truncation for multilingual passwords.
4. The boundary is enforced in the shared Zod schema and again at direct service boundaries (`loginUser`, `registerUser`, and `resetPasswordWithToken`). HTTP-only validation is insufficient because NextAuth and modular consumers call services directly.
5. Tests cover exact accepted and rejected boundaries, multilingual UTF-8 behavior, route-level rejection, and proof that invalid inputs are rejected before database lookup or bcrypt work.
6. Argos must not claim full NIST password-length conformance while bcrypt remains the storage algorithm. A future ADR must migrate new hashes to Argon2id, or to scrypt when Argon2id is unavailable, while supporting controlled verification and rehashing of legacy bcrypt records.

## Consequences

- Passwords that bcrypt would truncate are rejected instead of creating equivalent credentials with different suffixes.
- Existing passwords of 72 UTF-8 bytes or fewer continue to work without a data migration.
- Some 64-character multilingual passphrases can exceed 72 UTF-8 bytes and are temporarily rejected. This is an explicit legacy limitation, not a desired product policy.
- The shared constants and schemas keep standalone packages and MSA consumers aligned on the same security boundary.

## Verification evidence

- Shared-schema tests prove 72 ASCII bytes pass and 73 fail.
- Shared-schema tests prove 24 three-byte Korean characters pass and 25 fail.
- NextAuth service tests prove invalid input is rejected before user lookup and bcrypt comparison.
- Registration and reset service tests prove invalid direct calls fail before database or bcrypt work.
- Admin-login and password-reset route tests prove exact boundary behavior and prevent downstream credential processing after validation failure.

## References

National Institute of Standards and Technology. (2025). *Digital identity guidelines: Authentication and authenticator management (NIST Special Publication 800-63B)*. https://pages.nist.gov/800-63-4/sp800-63b.html

OWASP Foundation. (n.d.). *Authentication cheat sheet*. OWASP Cheat Sheet Series. Retrieved August 6, 2026, from https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Denial of service cheat sheet*. OWASP Cheat Sheet Series. Retrieved August 6, 2026, from https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Password storage cheat sheet*. OWASP Cheat Sheet Series. Retrieved August 6, 2026, from https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

dcodeIO. (n.d.). *bcrypt.js* [Computer software]. GitHub. Retrieved August 6, 2026, from https://github.com/dcodeIO/bcrypt.js
