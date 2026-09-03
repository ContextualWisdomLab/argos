/** @vitest-environment jsdom */
import React from 'react'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart } from './session-timeline-chart'

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: () => <div />,
  }
})

describe('SessionTimelineChart timestamp parse contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses each usage timestamp exactly once', () => {
    const usageTimeline: SessionTimelineUsage[] = [
      {
        timestamp: '2023-01-01T00:02:00.000Z',
        inputTokens: 20,
        outputTokens: 2,
        estimatedCostUsd: 0.002,
        model: 'model-b',
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:00:00.000Z',
        inputTokens: 10,
        outputTokens: 1,
        estimatedCostUsd: 0.001,
        model: 'model-a',
        isSubagent: false,
      },
      {
        timestamp: '2023-01-01T00:01:00.000Z',
        inputTokens: 15,
        outputTokens: 1,
        estimatedCostUsd: 0.0015,
        model: 'model-a',
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

    const parsedInputs = parse.mock.calls.map(([value]) => value)
    parse.mockRestore()

    expect(parsedInputs).toEqual(usageTimeline.map(({ timestamp }) => timestamp))
  })
})
