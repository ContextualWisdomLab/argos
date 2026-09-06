import { describe, it, expect } from 'vitest'
import { aggregateSummary } from './daily-rollup'

describe('daily-rollup performance', () => {
  const generateLargeRollups = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      projectId: 'proj-1',
      date: new Date(`2024-01-${(i % 31) + 1}`).toISOString(),
      sessionCount: 100,
      turnCount: 500,
      inputTokens: 10000,
      outputTokens: 5000,
      cacheReadTokens: 1000,
      cacheCreationTokens: 500,
      estimatedCostUsd: 0.5,
      activeUserIds: Array.from({ length: 50 }, (_, j) => `user-${j}`),
      activeUserCount: 50,
      skillCounts: Object.fromEntries(Array.from({ length: 100 }, (_, j) => [`skill-${j}`, Math.floor(Math.random() * 10)])),
      agentCounts: Object.fromEntries(Array.from({ length: 5 }, (_, j) => [`agent-${j}`, Math.floor(Math.random() * 20)])),
      modelTokens: { 'gpt-4': 10000, 'gpt-3.5': 5000 },
      userStats: []
    }))
  }

  it('benchmark aggregateSummary', () => {
    const rollups = generateLargeRollups(10000)
    const start = Date.now()
    const result = aggregateSummary(rollups)
    const end = Date.now()
    console.log(`aggregateSummary with 10000 rollups took ${end - start}ms`)
    expect(result).toBeDefined()
  })
})
