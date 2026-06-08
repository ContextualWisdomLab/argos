## 2026-06-08 - [Hardcoded Admin Password]
**Vulnerability:** Hardcoded `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `packages/web/src/lib/server/admin-auth.ts` could allow unauthorized access if source code is exposed.
**Learning:** Hardcoding credentials makes the application insecure and inflexible, and prevents credential rotation without code deployment.
**Prevention:** Use environment variables validated via schema (e.g., Zod) for all credentials and API keys. Keep default values secure and avoid committing secrets.
