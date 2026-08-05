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

describe('SessionTimelineChart', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders "No timeline data available" when usageTimeline is empty', () => {
    render(
      <SessionTimelineChart
        usageTimeline={[]}
        messages={[]}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )
    expect(screen.getByText('No timeline data available')).toBeDefined()
  })

  it('renders the chart correctly when data is provided', () => {
    const mockUsageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.001,
        model: 'gpt-4',
        isSubagent: false,
      },
    ]

    const mockMessages: SessionDetail['messages'] = [
      {
        role: 'HUMAN',
        content: 'Hello',
        sequence: 1,
        timestamp: '2023-01-01T00:00:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: null,
      },
      {
        role: 'TOOL',
        content: 'Tool Output',
        sequence: 2,
        timestamp: '2023-01-01T00:00:45.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'myTool',
      },
    ]

    render(
      <SessionTimelineChart
        usageTimeline={mockUsageTimeline}
        messages={mockMessages}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )
    expect(screen.getByTestId('responsive-container')).toBeDefined()
  })

  it('keeps tool summaries cumulative across later usage points', () => {
    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.001,
        model: 'gpt-4',
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:02:00.000Z',
        inputTokens: 200,
        outputTokens: 75,
        estimatedCostUsd: 0.002,
        model: 'gpt-4',
        isSubagent: false,
      },
    ]
    const messages: SessionDetail['messages'] = [
      {
        role: 'TOOL',
        content: 'First tool output',
        sequence: 1,
        timestamp: '2023-01-01T00:00:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'alpha',
      },
      {
        role: 'TOOL',
        content: 'Second tool output',
        sequence: 2,
        timestamp: '2023-01-01T00:01:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'beta',
      },
    ]

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={messages}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )

    const chartData = JSON.parse(
      screen.getByTestId('composed-chart-data').textContent ?? '[]'
    ) as Array<{ toolSummary: string }>
    expect(chartData.map(({ toolSummary }) => toolSummary)).toEqual([
      'alpha',
      'alpha, beta',
    ])
  })
})
