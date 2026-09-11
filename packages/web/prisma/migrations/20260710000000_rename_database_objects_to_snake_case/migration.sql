-- Keep database object names aligned with snake_case column/table names.
-- Prior migrations renamed columns but left Prisma-generated index and
-- foreign-key names in camelCase, which makes drift checks fail.

ALTER INDEX IF EXISTS "organizations_githubOrg_key" RENAME TO "organizations_github_org_key";
ALTER INDEX IF EXISTS "org_memberships_userId_orgId_key" RENAME TO "org_memberships_user_id_org_id_key";
ALTER INDEX IF EXISTS "cli_tokens_tokenHash_key" RENAME TO "cli_tokens_token_hash_key";
ALTER INDEX IF EXISTS "projects_orgId_slug_key" RENAME TO "projects_org_id_slug_key";

ALTER INDEX IF EXISTS "claude_sessions_projectId_startedAt_idx" RENAME TO "claude_sessions_project_id_started_at_idx";
ALTER INDEX IF EXISTS "claude_sessions_userId_startedAt_idx" RENAME TO "claude_sessions_user_id_started_at_idx";
ALTER INDEX IF EXISTS "events_projectId_timestamp_idx" RENAME TO "events_project_id_timestamp_idx";
ALTER INDEX IF EXISTS "events_userId_timestamp_idx" RENAME TO "events_user_id_timestamp_idx";
ALTER INDEX IF EXISTS "events_sessionId_idx" RENAME TO "events_session_id_idx";
ALTER INDEX IF EXISTS "events_projectId_isSkillCall_timestamp_idx" RENAME TO "events_project_id_is_skill_call_timestamp_idx";
ALTER INDEX IF EXISTS "events_projectId_isAgentCall_timestamp_idx" RENAME TO "events_project_id_is_agent_call_timestamp_idx";
ALTER INDEX IF EXISTS "usage_records_projectId_timestamp_idx" RENAME TO "usage_records_project_id_timestamp_idx";
ALTER INDEX IF EXISTS "usage_records_userId_timestamp_idx" RENAME TO "usage_records_user_id_timestamp_idx";

DROP INDEX IF EXISTS "messages_sessionId_sequence_idx";

ALTER TABLE "org_memberships" RENAME CONSTRAINT "org_memberships_userId_fkey" TO "org_memberships_user_id_fkey";
ALTER TABLE "org_memberships" RENAME CONSTRAINT "org_memberships_orgId_fkey" TO "org_memberships_org_id_fkey";
ALTER TABLE "cli_tokens" RENAME CONSTRAINT "cli_tokens_userId_fkey" TO "cli_tokens_user_id_fkey";
ALTER TABLE "projects" RENAME CONSTRAINT "projects_orgId_fkey" TO "projects_org_id_fkey";
ALTER TABLE "claude_sessions" RENAME CONSTRAINT "claude_sessions_projectId_fkey" TO "claude_sessions_project_id_fkey";
ALTER TABLE "claude_sessions" RENAME CONSTRAINT "claude_sessions_userId_fkey" TO "claude_sessions_user_id_fkey";
ALTER TABLE "events" RENAME CONSTRAINT "events_sessionId_fkey" TO "events_session_id_fkey";
ALTER TABLE "events" RENAME CONSTRAINT "events_userId_fkey" TO "events_user_id_fkey";
ALTER TABLE "events" RENAME CONSTRAINT "events_projectId_fkey" TO "events_project_id_fkey";
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_sessionId_fkey" TO "usage_records_session_id_fkey";
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_userId_fkey" TO "usage_records_user_id_fkey";
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_projectId_fkey" TO "usage_records_project_id_fkey";
ALTER TABLE "messages" RENAME CONSTRAINT "messages_sessionId_fkey" TO "messages_session_id_fkey";
