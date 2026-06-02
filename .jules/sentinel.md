## 2024-06-03 - Hardcoded Admin Password in codebase

**Vulnerability:** A critical application administration password was hardcoded within `packages/web/src/lib/server/admin-auth.ts`.
**Learning:** Hardcoding credentials makes them trivial to extract from version control or compiled artifacts, compromising admin accounts immediately.
**Prevention:** Source credentials dynamically from environment variables and ensure CI/CD environments are properly configured with placeholder values to test validation logic.
