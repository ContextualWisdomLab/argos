/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail, SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart } from './session-timeline-chart'

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    ComposedChart: ({ data }: { data: unknown }) => (
      <pre data-testid="composed-chart-data">{JSON.stringify(data)}</pre>
    ),
  }
})

describe('Performance Contract for SessionTimelineChart', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('measures sort overhead with large timeline data', () => {
    const N = 5000;
    const usageTimeline = Array.from({ length: N }, (_, i) => ({
      timestamp: `2023-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}.000Z`,
      inputTokens: 10,
      outputTokens: 5,
      estimatedCostUsd: 0,
      model: 'gpt-4',
      isSubagent: false
    }))
    // scramble
    usageTimeline.sort(() => Math.random() - 0.5)

    const messages = Array.from({ length: N / 10 }, (_, i) => ({
      role: 'TOOL',
      content: 'output',
      sequence: i,
      timestamp: `2023-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}.000Z`,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      toolName: 'myTool'
    })) as SessionDetail['messages']

    const SAMPLES = 5
    const durations: number[] = []

    // Warm-up
    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline.slice(0, 100)}
        messages={messages.slice(0, 10)}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )
    cleanup()

    for (let i = 0; i < SAMPLES; i++) {
      const start = performance.now()
      render(
        <SessionTimelineChart
          usageTimeline={usageTimeline}
          messages={messages}
          sessionStartedAt="2023-01-01T00:00:00.000Z"
        />
      )
      const end = performance.now()
      durations.push(end - start)
      cleanup()
    }

    durations.sort((a, b) => a - b)
    const median = durations[Math.floor(SAMPLES / 2)]!

    // Check that median rendering time in JSDOM is within reasonable bounds for this optimized size
    // Using a more generous relative threshold for CI environments
    expect(median).toBeLessThan(1500)
  })
})
