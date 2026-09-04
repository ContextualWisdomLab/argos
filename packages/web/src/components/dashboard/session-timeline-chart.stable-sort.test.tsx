/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart } from './session-timeline-chart'

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: ({ data }: { data: unknown }) => (
      <pre data-testid="composed-chart-data">{JSON.stringify(data)}</pre>
    ),
  }
})

describe('SessionTimelineChart stable usage ordering', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('preserves input order when usage timestamps are equal', () => {
    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 10,
        outputTokens: 5,
        estimatedCostUsd: 0.001,
        model: 'gpt-4',
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 20,
        outputTokens: 10,
        estimatedCostUsd: 0.002,
        model: 'gpt-4',
        isSubagent: false,
      },
    ]

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={[]}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )

    const chartData = JSON.parse(
      screen.getByTestId('composed-chart-data').textContent ?? '[]'
    ) as Array<{ input: number }>

    expect(chartData.map(({ input }) => input)).toEqual([10, 20])
  })
})
