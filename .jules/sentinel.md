## 2024-06-18 - Hardcoded Credentials in Source Code
**Vulnerability:** Found hardcoded admin credentials (`ADMIN_USERNAME` and `ADMIN_PASSWORD`) stored directly in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding secrets in source code is a critical security vulnerability because it exposes sensitive credentials to anyone with access to the source code repository or the compiled application.
**Prevention:** Always use environment variables for sensitive credentials and configuration. Validate these environment variables at application startup using a schema validation library like Zod (e.g., in `env.ts`) to ensure the application fails fast if required secrets are missing.
