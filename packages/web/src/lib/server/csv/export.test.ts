/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { csvField, getSessionTotals, buildSessionsCsv } from './export'

describe('csvField', () => {
  it('returns empty string for null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('preserves normal strings', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('hello world')).toBe('hello world')
  })

  it('preserves raw numbers without applying formula injection prevention', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('prevents formula injection for strings starting with dangerous characters', () => {
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('-123')).toBe("'-123")
    expect(csvField('@sum(1,2)')).toBe('"\'@sum(1,2)"') // wrapped because of comma
    expect(csvField('\ttest')).toBe("'\ttest")
    expect(csvField('\rtest')).toBe('"\'\rtest"') // wrapped because of \r
  })

  it('wraps fields containing quotes, commas, or newlines in quotes and escapes internal quotes', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('line1\nline2')).toBe('"line1\nline2"')
    expect(csvField('line1\r\nline2')).toBe('"line1\r\nline2"')
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('=hello, "world"')).toBe('"\'=hello, ""world"""') // Injection + quoting
  })
})

describe('getSessionTotals', () => {
  it('calculates totals correctly across usage records', () => {
    const mockSession = {
      usageRecords: [
        { inputTokens: 10, outputTokens: 20, estimatedCostUsd: 0.1 },
        { inputTokens: 5, outputTokens: 15, estimatedCostUsd: null },
        { inputTokens: 20, outputTokens: 0, estimatedCostUsd: 0.2 },
      ]
    } as any

    const totals = getSessionTotals(mockSession)
    // 0.1 + 0.2 in JS is 0.30000000000000004
    expect(totals).toEqual({
      inputTokens: 35,
      outputTokens: 35,
      estimatedCostUsd: 0.1 + 0.2,
    })
  })

  it('returns zeros for empty usage records', () => {
    const mockSession = { usageRecords: [] } as any
    expect(getSessionTotals(mockSession)).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
    })
  })
})

describe('buildSessionsCsv', () => {
  it('builds CSV successfully', () => {
    const mockSessions = [
      {
        id: 'sess-1',
        user: { name: 'Alice' },
        project: { name: 'ProjA' },
        title: null,
        messages: [{ content: 'First message\nwith newline' }],
        usageRecords: [{ inputTokens: 10, outputTokens: 5, estimatedCostUsd: 0.01 }],
        _count: { events: 2 },
        startedAt: new Date('2025-01-01T10:00:00.000Z'),
        endedAt: new Date('2025-01-01T10:05:00.000Z'),
      },
      {
        id: 'sess-2',
        user: { name: 'Bob' },
        project: { name: 'ProjB' },
        title: 'Custom Title, yes',
        messages: [],
        usageRecords: [],
        _count: { events: 0 },
        startedAt: new Date('2025-01-02T10:00:00.000Z'),
        endedAt: null,
      },
      {
        id: 'sess-3',
        user: { name: 'Charlie' },
        project: { name: 'ProjC' },
        title: '=malicious',
        messages: [{ content: '+malicious prompt' }],
        usageRecords: [],
        _count: { events: 1 },
        startedAt: new Date('2025-01-03T10:00:00.000Z'),
        endedAt: null,
      }
    ] as any[]

    const csv = buildSessionsCsv(mockSessions)

    expect(csv).toContain('\uFEFFSession ID,User,Project,Title,First Prompt,Input Tokens,Output Tokens,Estimated Cost USD,Event Count,Started At,Ended At')
    expect(csv).toContain('sess-1,Alice,ProjA,"First message\nwith newline","First message\nwith newline",10,5,0.01,2,2025-01-01T10:00:00.000Z,2025-01-01T10:05:00.000Z')
    expect(csv).toContain('sess-2,Bob,ProjB,"Custom Title, yes",,0,0,0,0,2025-01-02T10:00:00.000Z,')
    expect(csv).toContain('sess-3,Charlie,ProjC,\'=malicious,\'+malicious prompt,0,0,0,1,2025-01-03T10:00:00.000Z,')
  })
})
