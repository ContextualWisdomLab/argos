## 2025-06-06 - [CRITICAL] Fix hardcoded admin password
**Vulnerability:** A hardcoded admin password (`og9oRajx7h88v1RIj3eDgdrh9jgLYVV3`) was present in `packages/web/src/lib/server/admin-auth.ts`, exposing the admin credentials in the source code.
**Learning:** Hardcoded credentials can easily be checked into version control and compromise security. They should be loaded via environment variables and validated at runtime using tools like `zod`.
**Prevention:** Use environment variables for all secrets, ensure they are validated by the configuration loader (e.g. `env.ts`), and maintain proper `.env.example` templates and CI placeholder values so developers and automation understand the requirements.
