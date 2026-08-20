'use client'

import React, { useMemo } from 'react'
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

interface ToolCallPoint {
  toolName: string
  parsedTimestamp: number
}

interface ChartDataItem {
  relativeTime: string
  input: number
  output: number
  cost: number
  model?: string | null
  toolSummary: string
}

/** Format cumulative tool-call counts for the chart tooltip. */
function buildToolSummary(toolCounts: ReadonlyMap<string, number>): string {
  if (toolCounts.size === 0) return ''

  // Map preserves first-seen order, and Array#sort is stable. Equal-count tools
  // therefore retain the chronological order in which they first appeared.
  const sorted = Array.from(toolCounts.entries()).sort((a, b) => b[1] - a[1])

  const displayCount = Math.min(3, sorted.length)
  const displayItems = sorted.slice(0, displayCount).map(([name, count]) => {
    return count > 1 ? `${name} x${count}` : name
  })

  const remaining = sorted.length - displayCount
  if (remaining > 0) {
    return `${displayItems.join(', ')} +${remaining} more`
  }

  return displayItems.join(', ')
}

/**
 * Merge chronologically sorted usage and tool events into cumulative chart rows.
 *
 * Local copies are sorted in O(N log N + M log M). The forward cursor then
 * consumes every tool event once instead of filtering all M events for every
 * one of the N usage rows.
 */
function buildChartData(
  usageTimeline: SessionTimelineUsage[],
  toolCalls: ToolCallPoint[],
  sessionStartedAt: string
): ChartDataItem[] {
  // ⚡ Bolt Optimization: Array.prototype.sort() 비교자 내부에서 Date.parse()를 반복 호출하면 O(N log N)의 날짜 파싱 오버헤드가 발생합니다.
  // 이를 방지하기 위해 O(N) 1회 순회로 timestamp를 파싱하여 객체에 저장한 후 정렬하여 불필요한 반복 파싱을 제거했습니다.
  const sortedUsage = usageTimeline
    .map((usage) => ({ usage, parsedTime: Date.parse(usage.timestamp) }))
    .sort((a, b) => a.parsedTime - b.parsedTime)
  const sortedTools = [...toolCalls].sort(
    (a, b) => a.parsedTimestamp - b.parsedTimestamp
  )

  let toolIndex = 0
  const cumulativeToolCounts = new Map<string, number>()

  return sortedUsage.map(({ usage, parsedTime }) => {
    const currentTimestamp = parsedTime

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
      toolSummary: buildToolSummary(cumulativeToolCounts),
    }
  })
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

/** Render token usage, cost, model, and cumulative tool activity over time. */
export function SessionTimelineChart({
  usageTimeline,
  messages,
  sessionStartedAt,
}: SessionTimelineChartProps) {
  // Cache the normalized tool events until the underlying messages change.
  const toolCalls: ToolCallPoint[] = useMemo(() => {
    // ⚡ Bolt Optimization: .filter()와 .map()을 체이닝하면 중간 배열이 생성되어 메모리 할당 및 가비지 컬렉션 오버헤드가 발생합니다.
    // 단일 for...of 루프를 사용하여 O(N) 순회 1번으로 배열 순회 횟수와 메모리 오버헤드를 최적화했습니다.
    const result: ToolCallPoint[] = []
    for (const message of messages) {
      if (message.role === 'TOOL') {
        result.push({
          toolName: message.toolName ?? 'unknown',
          parsedTimestamp: Date.parse(message.timestamp),
        })
      }
    }
    return result
  }, [messages])

  const chartData = useMemo(
    () => buildChartData(usageTimeline, toolCalls, sessionStartedAt),
    [usageTimeline, sessionStartedAt, toolCalls]
  )

  if (usageTimeline.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No timeline data available</p>
    )
  }

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
