## 2024-07-25 - Prevent bcrypt DoS with max length validation
**Vulnerability:** Missing maximum length constraints on password inputs in Zod schemas for login, register, and password reset flows.
**Learning:** Because bcrypt hashing is computationally expensive (by design), extremely long input strings can cause severe CPU exhaustion (Denial of Service) during the hashing process. Standard Zod schemas (`z.string().min(8)`) only enforce minimum lengths, leaving them open to payloads of arbitrary size.
**Prevention:** Always append `.max(1024)` or a similarly reasonable upper bound to any input that will be passed into expensive hashing algorithms (like bcrypt or Argon2) to mitigate CPU exhaustion attacks.
