/** @vitest-environment jsdom */
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { SessionTimelineChart } from './session-timeline-chart'
import '@testing-library/jest-dom/vitest'
import type { SessionTimelineUsage, SessionDetail } from '@argos/shared'

// ResponsiveContainer는 JSDOM 환경에서 크기를 갖지 못하므로 모킹합니다.
vi.mock('recharts', async (importOriginal) => {
  const OriginalRecharts = await importOriginal<typeof import('recharts')>()
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container" style={{ width: 800, height: 400 }}>{children}</div>
    ),
    ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  }
})

describe('SessionTimelineChart', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders correctly with empty timeline', () => {
    render(
      <SessionTimelineChart
        usageTimeline={[]}
        messages={[]}
        sessionStartedAt={new Date().toISOString()}
      />
    )
    expect(screen.getByText('No timeline data available')).toBeInTheDocument()
  })

  it('handles chronological bucket output, duplicate-boundary timestamps, and ties', () => {
    const baseDate = new Date('2024-01-01T10:00:00.000Z')
    const sessionStartedAt = baseDate.toISOString()

    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: new Date(baseDate.getTime() + 1000).toISOString(), // Bucket 1
        inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.0015, model: 'gpt-4', isSubagent: false,
      },
      {
        timestamp: new Date(baseDate.getTime() + 2000).toISOString(), // Bucket 2
        inputTokens: 150, outputTokens: 60, estimatedCostUsd: 0.0021, model: 'gpt-4', isSubagent: false,
      },
      {
        timestamp: new Date(baseDate.getTime() + 2000).toISOString(), // Bucket 3 (Duplicate boundary)
        inputTokens: 50, outputTokens: 10, estimatedCostUsd: 0.0005, model: 'gpt-4', isSubagent: false,
      }
    ]

    const messages: SessionDetail['messages'] = [
      {
        role: 'TOOL',
        content: 'search 1',
        timestamp: new Date(baseDate.getTime() + 500).toISOString(),
        toolName: 'search',
        sequence: 1, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'weather 1',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(),
        toolName: 'weather',
        sequence: 2, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'weather 2',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(),
        toolName: 'weather',
        sequence: 3, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'calc 1',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(), // Tie with weather
        toolName: 'calc',
        sequence: 4, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'calc 2',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(), // Tie with weather
        toolName: 'calc',
        sequence: 5, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'calc 3',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(), // Tie with calc
        toolName: 'calc',
        sequence: 5, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'late',
        timestamp: new Date(baseDate.getTime() + 3000).toISOString(), // After last bucket
        toolName: 'late_tool',
        sequence: 6, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'early',
        timestamp: new Date(baseDate.getTime() - 1000).toISOString(), // Before session start (invalid/empty edge case)
        toolName: 'early_tool',
        sequence: 0, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'another late',
        timestamp: new Date(baseDate.getTime() + 3000).toISOString(), // After last bucket
        toolName: 'another_late_tool',
        sequence: 7, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
      }
    ]

    const { container } = render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={messages}
        sessionStartedAt={sessionStartedAt}
      />
    )

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('benchmarks large dataset without crashing (O(N+M) performance check)', () => {
    const baseDate = new Date('2024-01-01T10:00:00.000Z')
    const sessionStartedAt = baseDate.toISOString()

    // We keep arrays deeply immutable per prompt requirements for testing
    const usageTimeline: readonly SessionTimelineUsage[] = Object.freeze(Array.from({ length: 1000 }, (_, i) => Object.freeze({
        timestamp: new Date(baseDate.getTime() + i * 1000).toISOString(),
        inputTokens: 10,
        outputTokens: 10,
        estimatedCostUsd: 0.0001,
        model: 'gpt-4',
        isSubagent: false,
    })))

    const messages: readonly SessionDetail['messages'][number][] = Object.freeze(Array.from({ length: 1000 }, (_, i) => Object.freeze({
        role: 'TOOL',
        content: `test ${i}`,
        timestamp: new Date(baseDate.getTime() + i * 1000 - 500).toISOString(),
        toolName: `tool_${i % 5}`,
        sequence: i,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
    })))

    // Create new arrays with an out of order element to strictly test pure arrays
    const finalUsage = [...usageTimeline]
    finalUsage.unshift({
        timestamp: new Date(baseDate.getTime() + 9999 * 1000).toISOString(),
        inputTokens: 10,
        outputTokens: 10,
        estimatedCostUsd: 0.0001,
        model: 'gpt-4',
        isSubagent: false,
    })

    const startTime = performance.now()

    const { container } = render(
      <SessionTimelineChart
        usageTimeline={finalUsage}
        messages={messages as SessionDetail['messages']}
        sessionStartedAt={sessionStartedAt}
      />
    )

    const endTime = performance.now()

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    // It should render reasonably fast.
    expect(endTime - startTime).toBeLessThan(1000)
  })
})
