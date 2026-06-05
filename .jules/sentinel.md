## 2024-05-24 - Hardcoded Admin Password
**Vulnerability:** Found a hardcoded `ADMIN_PASSWORD` secret in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding credentials makes them accessible in source control and compiled assets, leading to severe exposure.
**Prevention:** Store secrets as environment variables, validate their presence at startup using tools like Zod, and inject them via CI/CD pipelines instead of embedding them directly in source code.
