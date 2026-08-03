/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail, SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart, CustomTooltip } from './session-timeline-chart'

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
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

  it('builds tool summaries correctly with varying tool counts', () => {
    const mockUsageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 10,
        outputTokens: 5,
        estimatedCostUsd: 0.0001,
        model: 'gpt-4',
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:03:00.000Z',
        inputTokens: 20,
        outputTokens: 10,
        estimatedCostUsd: 0.0002,
        model: null,
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:05:00.000Z',
        inputTokens: 30,
        outputTokens: 15,
        estimatedCostUsd: 0.0003,
        model: 'gpt-4',
        isSubagent: false,
      },
    ]

    const mockMessages: SessionDetail['messages'] = [
      { role: 'TOOL', content: '...', sequence: 1, timestamp: '2023-01-01T00:00:30.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'A' },
      { role: 'TOOL', content: '...', sequence: 2, timestamp: '2023-01-01T00:00:45.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'B' },
      { role: 'TOOL', content: '...', sequence: 3, timestamp: '2023-01-01T00:00:50.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'B' },
      { role: 'TOOL', content: '...', sequence: 4, timestamp: '2023-01-01T00:04:00.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'C' },
      { role: 'TOOL', content: '...', sequence: 5, timestamp: '2023-01-01T00:04:10.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'D' },
      { role: 'TOOL', content: '...', sequence: 6, timestamp: '2023-01-01T00:04:20.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'E' },
      { role: 'TOOL', content: '...', sequence: 7, timestamp: '2023-01-01T00:04:30.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: 'F' },

      { role: 'TOOL', content: '...', sequence: 8, timestamp: '2023-01-01T00:04:40.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: '' },
      { role: 'TOOL', content: '...', sequence: 9, timestamp: '2023-01-01T00:04:41.000Z', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, toolName: null },

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

  it('renders CustomTooltip correctly', () => {
    const { container: c1 } = render(<CustomTooltip active={false} />)
    expect(c1.innerHTML).toBe('')

    const { container: c2 } = render(<CustomTooltip active={true} payload={[]} />)
    expect(c2.innerHTML).toBe('')

    const { container: c3 } = render(<CustomTooltip active={true} payload={[{}]} />)
    expect(c3.innerHTML).toBe('')

    const mockPayload = [
      {
        payload: {
          relativeTime: '01:00',
          input: 100,
          output: 50,
          cost: 0.001,
          model: 'gpt-4',
          toolSummary: 'Tool A, Tool B',
        },
      },
    ]

    render(<CustomTooltip active={true} payload={mockPayload as any} />)
    expect(screen.getByText('01:00')).toBeDefined()
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('50')).toBeDefined()
    expect(screen.getByText('gpt-4')).toBeDefined()
    expect(screen.getByText('Tool A, Tool B')).toBeDefined()
  })

  it('renders CustomTooltip without model and toolSummary', () => {
    const mockPayload = [
      {
        payload: {
          relativeTime: '02:00',
          input: 10,
          output: 20,
          cost: 0.002,
        },
      },
    ]

    render(<CustomTooltip active={true} payload={mockPayload as any} />)
    expect(screen.getByText('02:00')).toBeDefined()
    expect(screen.queryByText('Model:')).toBeNull()
    expect(screen.queryByText('Tools:')).toBeNull()
  })
})
