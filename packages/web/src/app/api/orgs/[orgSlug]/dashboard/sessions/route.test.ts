import { describe, expect, it } from 'vitest'
import { buildSessionsCsv } from './route'

function csvForFields({
  user = 'Analyst',
  project = 'Project',
  title = 'Report',
  prompt = 'Prompt',
}: {
  user?: string
  project?: string
  title?: string
  prompt?: string
} = {}) {
  const session = {
    id: 'session-1',
    user: { id: 'user-1', name: user },
    project: { id: 'project-1', slug: 'project', name: project },
    title,
    agent: 'claude',
    startedAt: new Date('2026-09-04T00:00:00.000Z'),
    endedAt: null,
    usageRecords: [
      { inputTokens: 10, outputTokens: 2, estimatedCostUsd: 0.25 },
    ],
    messages: [{ content: prompt }],
    _count: { events: 3 },
  }

  return buildSessionsCsv([session as never])
}

describe('session CSV export boundary', () => {
  it('preserves ordinary values and RFC 4180 quoting through buildSessionsCsv', () => {
    const csv = csvForFields({
      user: 'Analyst',
      project: 'Alpha, Beta',
      title: 'Quarterly "Review"',
      prompt: 'Line 1; Line 2',
    })

    const [header, row] = csv.slice(1).split('\r\n')
    expect(header).toBe(
      'Session ID,User,Project,Title,First Prompt,Input Tokens,Output Tokens,Estimated Cost USD,Event Count,Started At,Ended At',
    )
    expect(row).toBe(
      'session-1,Analyst,"Alpha, Beta","Quarterly ""Review""",Line 1; Line 2,10,2,0.25,3,2026-09-04T00:00:00.000Z,',
    )
  })

  it.each([
    ['equals', '=CMD|'],
    ['plus', '+1+1'],
    ['minus', '-1'],
    ['at-sign', '@SUM(A1:A2)'],
    ['tab-prefixed', '\t=CMD|'],
    ['carriage-return-prefixed', '\r=CMD|'],
    ['line-feed-prefixed', '\n=CMD|'],
    ['leading-space', '  =CMD|'],
    ['vertical-tab', '\x0B+1'],
    ['escape', '\x1B-1'],
    ['full-width equals', '＝CMD'],
    ['full-width plus', '＋1'],
    ['full-width minus', '－1'],
    ['full-width at-sign', '＠SUM'],
  ])('neutralizes %s formula-leading user values in the real CSV row', (_label, value) => {
    const csv = csvForFields({ user: value })
    const row = csv.slice(1).split('\r\n')[1]!

    expect(row).toContain(value.includes('\r') || value.includes('\n') ? `"'${value}"` : `'${value}`)
  })

  it('keeps comma/quote/CRLF payloads inside one RFC 4180 field', () => {
    const payload = '",=1+1\r\n@SUM(A1:A2)'
    const csv = csvForFields({ prompt: payload })
    const expectedField = `"${payload.replaceAll('"', '""')}"`

    expect(csv).toContain(expectedField)
    expect(csv).not.toContain('\r\n@SUM(A1:A2),')
  })
})
