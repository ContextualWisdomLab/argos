-- Align foreign-key constraint and index names with the snake_case columns.
--
-- The earlier `20260416120000_rename_columns_to_snake_case` migration renamed
-- columns only; it left the implicit foreign-key and index identifiers in their
-- original camelCase form, which no longer match Prisma's default names derived
-- from the snake_case columns. This migration renames them so the database
-- matches `schema.prisma` and closes the schema/migration drift.
--
-- It also drops the orphaned `messages_sessionId_sequence_idx` index: the
-- `20260416180000_add_unique_session_sequence_to_messages` migration attempted
-- `DROP INDEX IF EXISTS "messages_session_id_sequence_idx"` (snake_case), but the
-- index created by the init migration was named `messages_sessionId_sequence_idx`
-- (camelCase), so the drop was a no-op and the index survived. The schema no
-- longer declares it, so it is removed here.

-- DropIndex
DROP INDEX "messages_sessionId_sequence_idx";

-- RenameForeignKey
ALTER TABLE "claude_sessions" RENAME CONSTRAINT "claude_sessions_projectId_fkey" TO "claude_sessions_project_id_fkey";

-- RenameForeignKey
ALTER TABLE "claude_sessions" RENAME CONSTRAINT "claude_sessions_userId_fkey" TO "claude_sessions_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "cli_tokens" RENAME CONSTRAINT "cli_tokens_userId_fkey" TO "cli_tokens_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "events" RENAME CONSTRAINT "events_projectId_fkey" TO "events_project_id_fkey";

-- RenameForeignKey
ALTER TABLE "events" RENAME CONSTRAINT "events_sessionId_fkey" TO "events_session_id_fkey";

-- RenameForeignKey
ALTER TABLE "events" RENAME CONSTRAINT "events_userId_fkey" TO "events_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "messages" RENAME CONSTRAINT "messages_sessionId_fkey" TO "messages_session_id_fkey";

-- RenameForeignKey
ALTER TABLE "org_memberships" RENAME CONSTRAINT "org_memberships_orgId_fkey" TO "org_memberships_org_id_fkey";

-- RenameForeignKey
ALTER TABLE "org_memberships" RENAME CONSTRAINT "org_memberships_userId_fkey" TO "org_memberships_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "projects" RENAME CONSTRAINT "projects_orgId_fkey" TO "projects_org_id_fkey";

-- RenameForeignKey
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_projectId_fkey" TO "usage_records_project_id_fkey";

-- RenameForeignKey
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_sessionId_fkey" TO "usage_records_session_id_fkey";

-- RenameForeignKey
ALTER TABLE "usage_records" RENAME CONSTRAINT "usage_records_userId_fkey" TO "usage_records_user_id_fkey";

-- RenameIndex
ALTER INDEX "claude_sessions_projectId_startedAt_idx" RENAME TO "claude_sessions_project_id_started_at_idx";

-- RenameIndex
ALTER INDEX "claude_sessions_userId_startedAt_idx" RENAME TO "claude_sessions_user_id_started_at_idx";

-- RenameIndex
ALTER INDEX "cli_tokens_tokenHash_key" RENAME TO "cli_tokens_token_hash_key";

-- RenameIndex
ALTER INDEX "events_projectId_isAgentCall_timestamp_idx" RENAME TO "events_project_id_is_agent_call_timestamp_idx";

-- RenameIndex
ALTER INDEX "events_projectId_isSkillCall_timestamp_idx" RENAME TO "events_project_id_is_skill_call_timestamp_idx";

-- RenameIndex
ALTER INDEX "events_projectId_timestamp_idx" RENAME TO "events_project_id_timestamp_idx";

-- RenameIndex
ALTER INDEX "events_sessionId_idx" RENAME TO "events_session_id_idx";

-- RenameIndex
ALTER INDEX "events_userId_timestamp_idx" RENAME TO "events_user_id_timestamp_idx";

-- RenameIndex
ALTER INDEX "org_memberships_userId_orgId_key" RENAME TO "org_memberships_user_id_org_id_key";

-- RenameIndex
ALTER INDEX "organizations_githubOrg_key" RENAME TO "organizations_github_org_key";

-- RenameIndex
ALTER INDEX "projects_orgId_slug_key" RENAME TO "projects_org_id_slug_key";

-- RenameIndex
ALTER INDEX "usage_records_projectId_timestamp_idx" RENAME TO "usage_records_project_id_timestamp_idx";

-- RenameIndex
ALTER INDEX "usage_records_userId_timestamp_idx" RENAME TO "usage_records_user_id_timestamp_idx";
