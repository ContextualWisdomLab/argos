/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SessionTimelineUsage } from '@argos/shared';

import { SessionTimelineChart } from './session-timeline-chart';

global.React = React;

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SessionTimelineChart timestamp parsing budget', () => {
  it('parses each usage timestamp exactly once before sorting', () => {
    const timestamps = [
      '2026-08-14T09:05:00.000Z',
      '2026-08-14T09:01:00.000Z',
      '2026-08-14T09:04:00.000Z',
      '2026-08-14T09:02:00.000Z',
      '2026-08-14T09:03:00.000Z',
    ];
    const usageTimeline: SessionTimelineUsage[] = timestamps.map(
      (timestamp, index) => ({
        timestamp,
        inputTokens: index + 1,
        outputTokens: 0,
        estimatedCostUsd: 0,
        model: 'test-model',
        isSubagent: false,
      }),
    );
    const parseSpy = vi.spyOn(Date, 'parse');

    render(
      <SessionTimelineChart
        usageTimeline={usageTimeline}
        messages={[]}
        sessionStartedAt="2026-08-14T09:00:00.000Z"
      />,
    );

    for (const timestamp of timestamps) {
      const matchingCalls = parseSpy.mock.calls.filter(
        ([candidate]) => candidate === timestamp,
      );
      expect(matchingCalls).toHaveLength(1);
    }
  });
});
