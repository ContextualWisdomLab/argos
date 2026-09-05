import { describe, expect, it } from 'vitest'
import { aggregateSummary, type DailyRollup } from './daily-rollup'

function rollup(overrides: Partial<DailyRollup> = {}): DailyRollup {
  return {
    date: '2026-09-05',
    sessionCount: 0,
    turnCount: 0,
    activeUserCount: 0,
    activeUserIds: [],
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    estimatedCostUsd: 0,
    skillCounts: {},
    agentCounts: {},
    modelTokens: {},
    userStats: [],
    ...overrides,
  }
}

function recordWithInheritedEntry(ownKey: string, ownValue: number): Record<string, number> {
  const values = Object.create({ inherited: 999 }) as Record<string, number>
  values[ownKey] = ownValue
  return values
}

describe('aggregateSummary own-property contract', () => {
  it('aggregates ordinary own keys and preserves empty-map behavior', () => {
    const summary = aggregateSummary([
      rollup({
        skillCounts: { review: 2 },
        agentCounts: { worker: 3 },
        modelTokens: { modelA: 5 },
      }),
      rollup({
        skillCounts: { review: 4 },
        agentCounts: { worker: 1 },
        modelTokens: { modelA: 7 },
      }),
      rollup(),
    ])

    expect(summary.topSkills).toEqual([{ skillName: 'review', callCount: 6 }])
    expect(summary.topAgents).toEqual([{ agentType: 'worker', callCount: 4 }])
    expect(summary.modelShare).toEqual([{ model: 'modelA', totalTokens: 12 }])
  })

  it('does not aggregate inherited enumerable properties', () => {
    const summary = aggregateSummary([
      rollup({
        skillCounts: recordWithInheritedEntry('ownSkill', 2),
        agentCounts: recordWithInheritedEntry('ownAgent', 3),
        modelTokens: recordWithInheritedEntry('ownModel', 5),
      }),
    ])

    expect(summary.topSkills).toEqual([{ skillName: 'ownSkill', callCount: 2 }])
    expect(summary.topAgents).toEqual([{ agentType: 'ownAgent', callCount: 3 }])
    expect(summary.modelShare).toEqual([{ model: 'ownModel', totalTokens: 5 }])
    expect(summary.topSkills.some(({ skillName }) => skillName === 'inherited')).toBe(false)
    expect(summary.topAgents.some(({ agentType }) => agentType === 'inherited')).toBe(false)
    expect(summary.modelShare.some(({ model }) => model === 'inherited')).toBe(false)
  })

  it('returns empty aggregate lists when every count map is empty', () => {
    const summary = aggregateSummary([rollup()])

    expect(summary.topSkills).toEqual([])
    expect(summary.topAgents).toEqual([])
    expect(summary.modelShare).toEqual([])
  })
})
