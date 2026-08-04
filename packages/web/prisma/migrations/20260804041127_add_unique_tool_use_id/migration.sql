/*
  Warnings:

  - A unique constraint covering the columns \`[session_id,tool_use_id]\` on the table \`messages\` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "messages_session_id_tool_use_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "messages_session_id_tool_use_id_key" ON "messages"("session_id", "tool_use_id");
