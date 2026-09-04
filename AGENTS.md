# AGENTS.md

Cross-agent conventions for the `argos` repo, readable by any coding agent
(Claude, Codex, Cursor, opencode, …). This is a pnpm + TypeScript monorepo
(`packages/web` with Prisma, `argos-ai`, `@argos/shared`).

<!-- BEGIN cwl-agent-guidance -->
## Agent guidance (CWL governance)

### Security & review gate
- Every PR runs a central **Security Scan** required gate, on every PR base
  **including stacked PRs**. It combines `osv-scan` + `dependency-review`
  (diff-scoped) and `trivy-fs` (repo-wide, CRITICAL/HIGH, fixable). This repo
  already carries its own `osv-scanner` and `dependency-review` workflows under
  `.github/workflows/`; the org gate is layered on top.
- **A failing `trivy-fs` is a REAL finding, not a flake.** Read the job log (it
  prints each finding's rule id / severity / file) or the run's SARIF results,
  then **remediate**:
  - This repo has no Dockerfile or k8s manifests, so findings are almost always
    vulnerable dependencies — bump the offending package in `package.json` and
    refresh `pnpm-lock.yaml` (`pnpm update <pkg>` / `pnpm up`), then re-run.
  - If a Dockerfile / IaC file is ever added, fix the misconfig instead.
  - Only for a genuine false positive, add a **narrow, documented**
    `.trivyignore(.yaml)` entry (one CVE, with a reason). Never broaden or
    disable the gate.
- Reproduce locally the same way CI sees it: `trivy --download-db-only` first
  (a stale local DB misses findings), then scan the **merge ref**, not just the
  PR head.
- The org `code_scanning` ruleset is intentionally **CodeQL-only** — multiple
  code-scanning tools can't converge on one PR ref. Gating is by the Security
  Scan **job result**, not the `code_scanning` rule; do not add tools to that rule.

### Code exploration
- There is no `.codegraph/` index in this repo, so use normal search
  (grep/find, ripgrep) to locate and understand code. If a `.codegraph/`
  index is ever added at the repo root, prefer CodeGraph
  (`codegraph explore "<query>"`, or the code-review-graph MCP tools) BEFORE
  grep/find — it surfaces callers/callees/impact that text search misses.

### Config & secrets (KV, not env)
- Org rule: do **not** read config/secrets from raw environment variables at
  runtime (`os.getenv()` in Python, `process.env.*` in TS/Node). Read them from
  a KV / credential registry. Org Actions secrets (e.g. `OPENAI_API_KEY`) flow
  **into** the KV via a bootstrap/CI step; runtime reads from the KV — env is
  only transport into the KV, never the runtime source.
- Reference implementation: xtrmLLMBatchPython's pgcrypto-encrypted Postgres
  credential registry (`get_credential(name)`). Reuse that pattern (a DB-backed
  KV is fine — this repo already runs Postgres via Prisma) unless a dedicated KV
  is adopted.
- **Known deviation to migrate:** `packages/web/src/lib/server/env.ts` currently
  parses secrets (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`,
  `ADMIN_COOKIE_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`) straight from
  `process.env` with Zod. Treat this as the source to migrate to the KV: keep
  env as bootstrap transport, but resolve these values through the credential
  registry at runtime. Do not add new `process.env` reads for secrets.
<!-- END cwl-agent-guidance -->
