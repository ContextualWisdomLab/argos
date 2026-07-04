import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SessionTimelineChart } from './session-timeline-chart'

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  }
})

describe('SessionTimelineChart', () => {
  it('renders a fallback message when usageTimeline is empty', () => {
    render(
      <SessionTimelineChart
        usageTimeline={[]}
        messages={[]}
        sessionStartedAt={new Date().toISOString()}
      />
    )
    expect(screen.getByText('No timeline data available')).toBeDefined()
  })

  it('renders the chart correctly when data is provided', () => {
    const startedAt = '2026-05-14T10:00:00Z'
    const usageTimeline = [
      {
        id: '1',
        sessionId: 's1',
        timestamp: '2026-05-14T10:01:00Z',
        inputTokens: 100,
        outputTokens: 50,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 150,
        estimatedCostUsd: 0.01,
        model: 'claude-3-5-sonnet',
        createdAt: new Date(),
      },
    ]

    const messages = [
      {
        id: 'm1',
        sessionId: 's1',
        timestamp: '2026-05-14T10:00:30Z',
        role: 'TOOL' as const,
        toolName: 'my_tool',
        content: '[]',
        createdAt: new Date(),
      },
    ]

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={messages}
        sessionStartedAt={startedAt}
      />
    )

    expect(screen.getByTestId('responsive-container')).toBeDefined()
  })
})
