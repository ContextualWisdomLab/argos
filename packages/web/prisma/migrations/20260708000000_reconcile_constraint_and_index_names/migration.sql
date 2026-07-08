-- 마이그레이션 히스토리와 schema.prisma 간 누적 드리프트 정리(reconcile).
-- 이 마이그레이션은 `prisma migrate diff --from-migrations ./prisma/migrations
--   --to-schema-datamodel ./prisma/schema.prisma --script` 로 생성되었습니다.
-- 배경:
--  1) 20260416120000_rename_columns_to_snake_case 는 컬럼만 snake_case 로 rename 했고,
--     FK 제약/인덱스 식별자는 camelCase 그대로 남아 schema.prisma 가 기대하는
--     snake_case 이름과 어긋나 있었습니다.
--  2) 20260416180000 의 `DROP INDEX IF EXISTS "messages_session_id_sequence_idx"` 는
--     init 이 만든 실제 인덱스명 "messages_sessionId_sequence_idx"(camelCase)와 달라
--     no-op 이 되었고, 결과적으로 (session_id, sequence) plain 인덱스가 고아로 남았습니다.
--     schema.prisma 의 Message 모델에는 해당 인덱스가 선언돼 있지 않습니다.
-- 아래 문장들은 마이그레이션 적용 결과 스키마를 schema.prisma 와 일치시켜
-- CI 의 "Check schema/migration drift" 스텝(--exit-code)이 0 을 반환하도록 만듭니다.

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

