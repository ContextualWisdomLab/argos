🎯 **What:**
Removed the hardcoded `ADMIN_PASSWORD` from `packages/web/src/lib/server/admin-auth.ts` and configured the application to read this value from the `ADMIN_PASSWORD` environment variable using `env.ts`.

⚠️ **Risk:**
Storing secrets like administrative passwords in source code makes them easily accessible to anyone who can view the code, such as other team members, automated tooling, or an attacker via a source code leak. This could lead to a full compromise of the application's administrative capabilities.

🛡️ **Solution:**
Added `ADMIN_PASSWORD: z.string().trim().min(8)` validation in `packages/web/src/lib/server/env.ts` to enforce a secure password pattern. Updated `packages/web/src/lib/server/admin-auth.ts` to consume `env.ADMIN_PASSWORD` instead of the hardcoded literal. Also added the environment variable to `.env.example` and the GitHub actions `ci.yml` pipeline to ensure builds pass properly without issues.
