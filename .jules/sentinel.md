## 2025-02-28 - Removed hardcoded ADMIN_PASSWORD
**Vulnerability:** A hardcoded admin password (`og9oRajx7h88v1RIj3eDgdrh9jgLYVV3`) was found in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** The secret was hardcoded into the source code, which meant any user with access to the source code could easily impersonate an administrator.
**Prevention:** Always read secrets and sensitive configuration values from environment variables (`env.ts` with Zod validation) instead of hardcoding them into the codebase. Ensure the `.env.example` file is updated when adding new required environment variables.
