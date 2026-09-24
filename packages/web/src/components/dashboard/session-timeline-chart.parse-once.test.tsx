/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionTimelineUsage } from '@argos/shared'
import { SessionTimelineChart } from './session-timeline-chart'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: () => <div data-testid="composed-chart" />,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

describe('SessionTimelineChart timestamp normalization', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('parses each usage timestamp once while building chart data', () => {
    const timestamps = [
      '2026-09-24T05:03:00.000Z',
      '2026-09-24T05:02:00.000Z',
      '2026-09-24T05:01:00.000Z',
    ]
    const usageTimeline: SessionTimelineUsage[] = timestamps.map((timestamp, index) => ({
      timestamp,
      inputTokens: 100 + index,
      outputTokens: 50 + index,
      estimatedCostUsd: 0.001 + index * 0.001,
      model: 'test-model',
      isSubagent: false,
    }))
    const parseSpy = vi.spyOn(Date, 'parse')

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={[]}
        sessionStartedAt="2026-09-24T05:00:00.000Z"
      />
    )

    for (const timestamp of timestamps) {
      const calls = parseSpy.mock.calls.filter(([value]) => value === timestamp)
      expect(calls).toHaveLength(1)
    }
  })
})
