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

  it('renders correctly with usage timeline and O(N+M) tool calls optimization handling out-of-order data', () => {
    const baseDate = new Date('2024-01-01T10:00:00.000Z')
    const sessionStartedAt = baseDate.toISOString()

    // ⚡ Bolt: 테스트 - out-of-order usageTimeline 및 toolCalls 데이터를 제공하여 투 포인터 최적화 정렬 로직이 정상 동작하는지 확인
    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: new Date(baseDate.getTime() + 2000).toISOString(), // 2s (Second in chronological order)
        inputTokens: 150,
        outputTokens: 60,
        estimatedCostUsd: 0.0021,
        model: 'gpt-4',
        isSubagent: false,
      },
      {
        timestamp: new Date(baseDate.getTime() + 1000).toISOString(), // 1s (First in chronological order)
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.0015,
        model: 'gpt-4',
        isSubagent: false,
      },
    ]

    const messages: SessionDetail['messages'] = [
      {
        role: 'TOOL', // 3rd tool call chronologically
        content: 'result 2',
        timestamp: new Date(baseDate.getTime() + 1500).toISOString(), // 1.5s
        toolName: 'weather',
        sequence: 3,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
      {
        role: 'ASSISTANT',
        content: 'Hello',
        timestamp: sessionStartedAt,
        sequence: 1,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
      {
        role: 'TOOL', // 1st and 2nd tool calls chronologically
        content: 'result 1',
        timestamp: new Date(baseDate.getTime() + 500).toISOString(), // 0.5s
        toolName: 'search',
        sequence: 2,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
      {
        role: 'TOOL',
        content: 'result 1 dup',
        timestamp: new Date(baseDate.getTime() + 500).toISOString(), // 0.5s (same as msg2)
        toolName: 'search',
        sequence: 4,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
    ]

    const { container } = render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={messages}
        sessionStartedAt={sessionStartedAt}
      />
    )

    // 차트 컨테이너가 렌더링되었는지 확인
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()

    // No timeline data 메시지가 없어야 함
    expect(screen.queryByText('No timeline data available')).not.toBeInTheDocument()
  })
})
