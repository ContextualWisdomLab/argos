
## 2024-05-24 - [CRITICAL] Fix Hardcoded Admin Credentials in Authentication Logic
**Vulnerability:** Found hardcoded `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding credentials in source code exposes them to anyone with read access to the repository and makes it impossible to securely manage or rotate these secrets across different environments.
**Prevention:** Always use environment variables for secrets and credentials. Use tools like `zod` to validate their presence at runtime (e.g., in `env.ts`) and ensure proper placeholder values are added to `.env.example` and CI workflows to prevent build regressions.
