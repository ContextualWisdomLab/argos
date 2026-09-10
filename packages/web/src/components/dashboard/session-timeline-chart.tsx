'use client'

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { formatTokens, formatCost, formatRelativeTime } from '@/lib/format'
import type { SessionTimelineUsage, SessionDetail } from '@argos/shared'

interface SessionTimelineChartProps {
  usageTimeline: SessionTimelineUsage[]
  messages: SessionDetail['messages']
  sessionStartedAt: string
}



interface ChartDataItem {
  relativeTime: string
  input: number
  output: number
  cost: number
  model?: string | null
  toolSummary: string
}

function buildChartData(
  usageTimeline: SessionTimelineUsage[],
  toolCalls: { parsedTimestamp: number; toolName: string }[],
  sessionStartedAt: string
): ChartDataItem[] {
  const sortedUsage = usageTimeline
    .map((usage) => ({ usage, timestamp: Date.parse(usage.timestamp) }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const sortedTools = [...toolCalls].sort(
    (a, b) => a.parsedTimestamp - b.parsedTimestamp
  )

  let toolIndex = 0
  const cumulativeToolCounts = new Map<string, number>()

  return sortedUsage.map(({ usage, timestamp: currentTimestamp }) => {
    while (
      toolIndex < sortedTools.length &&
      sortedTools[toolIndex]!.parsedTimestamp <= currentTimestamp
    ) {
      const toolName = sortedTools[toolIndex]!.toolName || 'unknown'
      cumulativeToolCounts.set(
        toolName,
        (cumulativeToolCounts.get(toolName) ?? 0) + 1
      )
      toolIndex += 1
    }

    return {
      relativeTime: formatRelativeTime(usage.timestamp, sessionStartedAt),
      input: usage.inputTokens,
      output: usage.outputTokens,
      cost: usage.estimatedCostUsd,
      model: usage.model,
      toolSummary: getToolSummaryForIndex(cumulativeToolCounts),
    }
  })
}

function getToolSummaryForIndex(toolCounts: ReadonlyMap<string, number>): string {
  if (toolCounts.size === 0) return ''

  // 배열로 변환하여 카운트 내림차순 정렬
  const sorted = Array.from(toolCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // 최대 3개까지만 표시
  const displayCount = Math.min(3, sorted.length)
  const displayItems = sorted.slice(0, displayCount).map(({ name, count }) => {
    return count > 1 ? `${name} x${count}` : name
  })

  const remaining = sorted.length - displayCount
  if (remaining > 0) {
    return `${displayItems.join(', ')} +${remaining} more`
  }

  return displayItems.join(', ')
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string> & { chartData?: ChartDataItem[] }) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload as ChartDataItem | undefined
  if (!data) return null

  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-3">
      <p className="font-medium mb-2">{data.relativeTime}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-chart-1" />
          <span className="text-muted-foreground">Input Tokens:</span>
          <span className="font-medium tabular-nums">{formatTokens(data.input)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-chart-2" />
          <span className="text-muted-foreground">Output Tokens:</span>
          <span className="font-medium tabular-nums">{formatTokens(data.output)}</span>
        </div>
        <div className="pt-1 mt-1 border-t border-border">
          <span className="text-muted-foreground">Cost:</span>
          <span className="font-medium ml-2 tabular-nums">{formatCost(data.cost)}</span>
        </div>
        {data.model && (
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium ml-2">{data.model}</span>
          </div>
        )}
        {data.toolSummary && (
          <div className="pt-1 mt-1 border-t border-border">
            <span className="text-muted-foreground">Tools:</span>
            <span className="font-medium ml-2">{data.toolSummary}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function SessionTimelineChart({
  usageTimeline,
  messages,
  sessionStartedAt,
}: SessionTimelineChartProps) {
  if (usageTimeline.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No timeline data available</p>
    )
  }

  const toolCalls = messages
    .filter((m) => m.role === 'TOOL')
    .map((m) => ({
      parsedTimestamp: Date.parse(m.timestamp),
      toolName: m.toolName ?? 'unknown',
    }))

  const chartData: ChartDataItem[] = buildChartData(
    usageTimeline,
    toolCalls,
    sessionStartedAt
  )

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="relativeTime"
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          style={{ fontSize: '11px' }}
        />
        <YAxis
          tickFormatter={formatTokens}
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          style={{ fontSize: '11px' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
        <Bar
          dataKey="input"
          stackId="tokens"
          fill="var(--color-chart-1)"
          name="Input Tokens"
        />
        <Bar
          dataKey="output"
          stackId="tokens"
          fill="var(--color-chart-2)"
          name="Output Tokens"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
