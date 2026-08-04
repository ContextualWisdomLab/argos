const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'packages/web/src/app/api/events/route.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const upsertPatch = `
async function upsertToolMessage(opts: {
  sessionId: string
  toolUseId: string
  toolName: string
  toolInput?: Record<string, unknown>
  toolResponse?: string
  isPost: boolean
}): Promise<void> {
  if (opts.isPost) {
    const existing = await db.message.findFirst({
      where: { sessionId: opts.sessionId, toolUseId: opts.toolUseId },
    })
    if (existing) {
      const startMs = existing.timestamp.getTime()
      const endMs = Date.now()
      await db.message.update({
        where: { id: existing.id },
        data: {
          content: truncateMessageContent(opts.toolResponse ?? ''),
          durationMs: Math.max(0, endMs - startMs),
        },
      })
      return
    }
  }

  try {
    await db.message.upsert({
      where: {
        sessionId_toolUseId: {
          sessionId: opts.sessionId,
          toolUseId: opts.toolUseId,
        }
      },
      create: {
        sessionId: opts.sessionId,
        role: 'TOOL',
        content: truncateMessageContent(opts.toolResponse ?? ''),
        sequence: 0,
        timestamp: new Date(),
        toolName: opts.toolName,
        toolInput: (opts.toolInput as Prisma.InputJsonValue) ?? null,
        toolUseId: opts.toolUseId,
        durationMs: null,
      },
      update: {}
    })
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code !== 'P2002') {
      throw err
    }
  }
}
`;

content = content.replace(/async function upsertToolMessage[\s\S]*\}\n\n\/\/ hookEventName/m, upsertPatch + '\n\n// hookEventName');
fs.writeFileSync(filePath, content, 'utf-8');
