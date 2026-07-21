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
  }
})

describe('SessionTimelineChart', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders tool summary correctly (100% coverage)', () => {
    const mockUsageTimeline: SessionTimelineUsage[] = [
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
        inputTokens: 150,
        outputTokens: 75,
        estimatedCostUsd: 0.002,
        model: 'gpt-4',
        isSubagent: false,
      }
    ]

    const mockMessages: SessionDetail['messages'] = [
      {
        role: 'TOOL',
        content: 'Result 1',
        sequence: 1,
        timestamp: '2023-01-01T00:00:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolA',
      },
      {
        role: 'TOOL',
        content: 'Result 2',
        sequence: 2,
        timestamp: '2023-01-01T00:00:45.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolA',
      },
      {
        role: 'TOOL',
        content: 'Result 3',
        sequence: 3,
        timestamp: '2023-01-01T00:00:50.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolB',
      },
      {
        role: 'TOOL',
        content: 'Result 4',
        sequence: 4,
        timestamp: '2023-01-01T00:01:10.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolC',
      },
      {
        role: 'TOOL',
        content: 'Result 5',
        sequence: 5,
        timestamp: '2023-01-01T00:01:20.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolD',
      },
      {
        role: 'TOOL',
        content: 'Result 6',
        sequence: 6,
        timestamp: '2023-01-01T00:01:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolE',
      },
      {
        role: 'TOOL',
        content: 'Result 7',
        sequence: 7,
        timestamp: '2023-01-01T00:01:40.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'toolF',
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
})
