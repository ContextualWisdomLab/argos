/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TokenUsageChart, CustomTooltip } from './token-usage-chart'
import type { UsageSeries } from '@argos/shared'

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ data }: { data: unknown }) => (
      <pre data-testid="composed-chart-data">{JSON.stringify(data)}</pre>
    ),
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  }
})

describe('TokenUsageChart', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the chart correctly when data is provided', () => {
    const mockData: UsageSeries[] = [
      {
        date: '2023-01-01',
        inputTokens: 1000,
        outputTokens: 500,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        estimatedCostUsd: 0.002,
      },
    ]

    render(<TokenUsageChart data={mockData} />)
    expect(screen.getByTestId('responsive-container')).toBeDefined()
    expect(screen.getByTestId('composed-chart-data')).toBeDefined()
  })
})

describe('CustomTooltip', () => {
  it('returns null when active is false or payload is empty', () => {
    const { container: c1 } = render(<CustomTooltip active={false} /> as unknown as undefined)
    expect(c1.firstChild).toBeNull()

    const { container: c2 } = render(<CustomTooltip active={true} payload={[]} /> as unknown as undefined)
    expect(c2.firstChild).toBeNull()
  })

  it('renders correctly with data', () => {
    const payload = [{
      value: 1000,
    }, {
      value: 500,
    }]
    const { getAllByText } = render(<CustomTooltip active={true} payload={payload as unknown as undefined} label="Jan 1" /> as unknown as undefined)
    expect(getAllByText('Jan 1')[0]).toBeDefined()
  })
})
