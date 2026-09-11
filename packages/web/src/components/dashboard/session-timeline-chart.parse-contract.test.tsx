/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail, SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart } from './session-timeline-chart'

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ComposedChart: () => <div />,
  }
})

describe('SessionTimelineChart timestamp parsing', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('does not parse tool timestamps when usage timeline is empty', () => {
    const messages: SessionDetail['messages'] = [
      {
        role: 'TOOL',
        content: 'Unused tool output',
        sequence: 1,
        timestamp: '2023-01-01T00:00:30.000Z',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        toolName: 'alpha',
      },
    ]
    const parse = vi.spyOn(Date, 'parse')

    render(
      <SessionTimelineChart
        usageTimeline={[]}
        messages={messages}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )

    expect(parse).not.toHaveBeenCalled()
  })

  it('parses each usage timestamp once before sorting', () => {
    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:04:00.000Z',
        inputTokens: 400,
        outputTokens: 0,
        estimatedCostUsd: 0,
        model: null,
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 100,
        outputTokens: 0,
        estimatedCostUsd: 0,
        model: null,
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:03:00.000Z',
        inputTokens: 300,
        outputTokens: 0,
        estimatedCostUsd: 0,
        model: null,
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:02:00.000Z',
        inputTokens: 200,
        outputTokens: 0,
        estimatedCostUsd: 0,
        model: null,
        isSubagent: false,
      },
    ]
    const parse = vi.spyOn(Date, 'parse')

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={[]}
        sessionStartedAt="2023-01-01T00:00:00.000Z"
      />
    )

    expect(parse).toHaveBeenCalledTimes(usageTimeline.length)
    expect(parse.mock.calls.map(([value]) => value)).toEqual(
      usageTimeline.map(({ timestamp }) => timestamp)
    )
  })
})
