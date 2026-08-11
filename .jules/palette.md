
## 2024-05-10 - Unrelated Test Failures
**Learning:** During test runs in the `@argos/web` workspace, tests involving the database (e.g. `skill-aggregation.test.ts`, `daily-rollup.test.ts`, and API routes testing) may fail with `FATAL: (ENOTFOUND) tenant/user postgres.[project] not found`. This indicates an environmental issue or database connection problem in the CI/local test environment and is not related to UX modifications.
**Action:** When working as the Palette persona and verifying UX enhancements in a targeted component, isolate test runs to the specific file or folder (e.g., `pnpm --filter @argos/web run test src/components/admin/`) to avoid unrelated backend test failures. Do not expand the scope to fix these database test failures unless explicitly instructed.
