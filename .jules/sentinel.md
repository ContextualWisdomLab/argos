## 2024-05-18 - [HIGH] Fix Hardcoded Admin Password
**Vulnerability:** A hardcoded administrative password (`ADMIN_PASSWORD`) was stored directly in the `admin-auth.ts` source code and committed to version control.
**Learning:** Storing secrets such as passwords directly in code is a severe security risk. Anyone with read access to the source code can easily obtain the password, and attackers who find source code files via directory traversal or accidental exposure can use the password to gain unauthorized access to administrative functions.
**Prevention:** Always use environment variables configured via `env.ts` (powered by Zod) for secrets and sensitive values. Provide an `.env.example` placeholder instead of hardcoding any default credentials in source code.
