## 2024-06-10 - [Hardcoded Admin Password]
**Vulnerability:** A hardcoded admin password `og9oRajx7h88v1RIj3eDgdrh9jgLYVV3` was found in `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoded credentials in source code pose a critical security risk because anyone with access to the source code (or a compiled version of it) can extract the credentials and use them to gain unauthorized access to the application.
**Prevention:** Always use environment variables for sensitive data like passwords, API keys, and secrets. Ensure they are validated securely at runtime using tools like Zod (e.g., in `env.ts`) and provide dummy values in `.env.example` and CI workflows to maintain a robust and secure development/deployment pipeline.
