## 2025-02-14 - Hardcoded Admin Credentials
**Vulnerability:** A critical security vulnerability was found in `packages/web/src/lib/server/admin-auth.ts` where the admin username (`admin`) and admin password (`og9oRajx7h88v1RIj3eDgdrh9jgLYVV3`) were hardcoded in the source code. This is dangerous because anyone with access to the source code repository can easily extract these secrets and compromise the admin interface.
**Learning:** Hardcoding credentials exposes sensitive data to unauthorized parties via source control systems. This practice circumvents the principle of least privilege.
**Prevention:** Always define secrets in environment configuration systems (e.g. `.env`) and use validation libraries like `zod` to securely import them during module initialization.
