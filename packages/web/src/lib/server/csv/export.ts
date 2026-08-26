import { Prisma } from '@prisma/client'

export const sessionInclude = {
  user: { select: { id: true, name: true } },
  project: { select: { id: true, slug: true, name: true } },
  usageRecords: {
    select: { inputTokens: true, outputTokens: true, estimatedCostUsd: true },
  },
  // Title fallback — 저장된 title이 없는 세션용으로 첫 HUMAN 메시지 1건만 로딩
  messages: {
    where: { role: 'HUMAN' as const },
    orderBy: [{ timestamp: 'asc' as const }, { sequence: 'asc' as const }],
    take: 1,
    select: { content: true },
  },
  _count: { select: { events: true } },
} satisfies Prisma.ClaudeSessionInclude

export type SessionWithInclude = Prisma.ClaudeSessionGetPayload<{ include: typeof sessionInclude }>

export function getSessionTotals(session: SessionWithInclude) {
  let inputTokens = 0
  let outputTokens = 0
  let estimatedCostUsd = 0

  for (const r of session.usageRecords) {
    inputTokens += r.inputTokens
    outputTokens += r.outputTokens
    estimatedCostUsd += r.estimatedCostUsd ?? 0
  }

  return { inputTokens, outputTokens, estimatedCostUsd }
}

export function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // Prevent CSV Formula Injection
  if (typeof value !== 'number' && /^[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function buildSessionsCsv(sessions: SessionWithInclude[]) {
  const headers = [
    'Session ID',
    'User',
    'Project',
    'Title',
    'First Prompt',
    'Input Tokens',
    'Output Tokens',
    'Estimated Cost USD',
    'Event Count',
    'Started At',
    'Ended At',
  ]

  const rows = sessions.map((session) => {
    const totals = getSessionTotals(session)
    const title = session.title?.trim() || session.messages[0]?.content.slice(0, 200).trim() || ''

    return [
      session.id,
      session.user.name,
      session.project.name,
      title,
      session.messages[0]?.content ?? '',
      totals.inputTokens,
      totals.outputTokens,
      totals.estimatedCostUsd,
      session._count.events,
      session.startedAt.toISOString(),
      session.endedAt?.toISOString() ?? '',
    ].map(csvField).join(',')
  })

  return `\uFEFF${[headers.join(','), ...rows].join('\r\n')}`
}
