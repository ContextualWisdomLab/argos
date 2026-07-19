## 2025-02-14 - Limit input length for password hashing (DoS prevention)
**Vulnerability:** User-provided passwords in `auth.ts` schemas (`LoginRequestSchema`, `RegisterRequestSchema`) and `password-reset/[token]/route.ts` were passed directly to `bcrypt` without length limits. Because bcrypt is computationally expensive, attackers could send extremely large string payloads causing excessive CPU usage and potential DoS.
**Learning:** `z.string().min(8)` only checks the minimum boundary. Without `.max()`, arbitrarily large inputs bypass simple schema constraints.
**Prevention:** Always enforce a `.max(1024)` on password or sensitive string fields mapped directly to expensive cryptographic functions or database schemas.
