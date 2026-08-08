/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { csvField, getSessionTotals, buildSessionsCsv } from './csv'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles regular strings and numbers', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes and commas and newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('mitigates CSV injection (Spreadsheet Macro Injection)', () => {
    expect(csvField('=1+2')).toBe(`'=1+2`)
    expect(csvField('+1+2')).toBe(`'+1+2`)
    expect(csvField('-1+2')).toBe(`'-1+2`)
    expect(csvField('@sum(1,2)')).toBe(`"'@sum(1,2)"`) // comma causes it to be quoted
    expect(csvField('\tdata')).toBe(`'\tdata`)
    expect(csvField('\rdata')).toBe(`"'\rdata"`) // \r causes it to be quoted
    expect(csvField('=cmd|/c calc')).toBe(`'=cmd|/c calc`)
  })
})

describe('getSessionTotals', () => {
  it('calculates totals correctly', () => {
    const session = {
      usageRecords: [
        { inputTokens: 10, outputTokens: 20, estimatedCostUsd: 0.1 },
        { inputTokens: 5, outputTokens: 10, estimatedCostUsd: 0.05 },
        { inputTokens: 0, outputTokens: 0, estimatedCostUsd: null },
      ]
    } as any

    expect(getSessionTotals(session)).toEqual({
      inputTokens: 15,
      outputTokens: 30,
      estimatedCostUsd: 0.15000000000000002
    })
  })
})

describe('buildSessionsCsv', () => {
  it('builds CSV correctly', () => {
    const session = {
      id: 'sess-123',
      user: { name: 'Alice' },
      project: { name: 'ProjA' },
      title: 'Test Session',
      messages: [{ content: 'Hello AI' }],
      usageRecords: [
        { inputTokens: 10, outputTokens: 20, estimatedCostUsd: 0.1 },
      ],
      _count: { events: 5 },
      startedAt: new Date('2024-01-01T00:00:00Z'),
      endedAt: new Date('2024-01-01T01:00:00Z'),
    } as any

    const csv = buildSessionsCsv([session])
    expect(csv).toContain('Session ID,User,Project,Title,First Prompt,Input Tokens,Output Tokens,Estimated Cost USD,Event Count,Started At,Ended At')
    expect(csv).toContain('sess-123,Alice,ProjA,Test Session,Hello AI,10,20,0.1,5,2024-01-01T00:00:00.000Z,2024-01-01T01:00:00.000Z')
  })

  it('uses fallback title if title is null', () => {
    const session = {
      id: 'sess-123',
      user: { name: 'Alice' },
      project: { name: 'ProjA' },
      title: null,
      messages: [{ content: 'Hello AI long prompt that should be used as fallback' }],
      usageRecords: [],
      _count: { events: 0 },
      startedAt: new Date('2024-01-01T00:00:00Z'),
      endedAt: null,
    } as any

    const csv = buildSessionsCsv([session])
    expect(csv).toContain('Hello AI long prompt that should be used as fallback')
  })

  it('mitigates injection in generated CSV', () => {
    const session = {
      id: 'sess-123',
      user: { name: '=cmd|/c calc' }, // Injection in user name
      project: { name: 'ProjA' },
      title: '+1+2', // Injection in title
      messages: [{ content: '@sum(A1:A2)' }], // Injection in prompt
      usageRecords: [],
      _count: { events: 0 },
      startedAt: new Date('2024-01-01T00:00:00Z'),
      endedAt: null,
    } as any

    const csv = buildSessionsCsv([session])
    expect(csv).toContain(`'=cmd|/c calc`)
    expect(csv).toContain(`'+1+2`)
    expect(csv).toContain(`'@sum(A1:A2)`)
  })
})

  it('handles missing messages in fallback title', () => {
    const session = {
      id: 'sess-123',
      user: { name: 'Alice' },
      project: { name: 'ProjA' },
      title: null,
      messages: [],
      usageRecords: [],
      _count: { events: 0 },
      startedAt: new Date('2024-01-01T00:00:00Z'),
      endedAt: null,
    } as any

    const csv = buildSessionsCsv([session])
    expect(csv).toContain('sess-123,Alice,ProjA,,')
  })
