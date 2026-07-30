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
  timestamp: string
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
  // ⚡ Bolt: messages 배열을 필터링하고 매핑하는 비용이 높은 작업을 useMemo로 최적화하여
  // 리렌더링 시마다 발생하는 불필요한 연산을 방지함. (배열 생성 오버헤드 감소)
  const toolCalls: ToolCallPoint[] = useMemo(() => {
    return messages
      .filter((m) => m.role === 'TOOL')
      .map((m) => ({
        timestamp: m.timestamp,
        toolName: m.toolName ?? 'unknown',
        parsedTimestamp: new Date(m.timestamp).getTime(),
      }))
  }, [messages])

  // ⚡ Bolt: usageTimeline 배열을 순회하며 차트 데이터를 생성하는 비용이 높은 작업을
  // useMemo로 최적화하여 데이터 변경이 없을 때 캐시된 결과를 재사용함.
  // 이로 인해 리렌더링 속도가 향상됨.
  const chartData: ChartDataItem[] = useMemo(() => {
    // ⚡ Bolt: Replace O(N*M) nested filter loop with O(N+M) pointer-based algorithm
    // 1. Sort tool calls by timestamp chronologically
    const sortedTools = [...toolCalls].sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)

    // 2. Sort usageTimeline indices chronologically to preserve original order
    // while allowing efficient single-pass pointer traversal.
    const sortedIndices = usageTimeline
      .map((_, idx) => idx)
      .sort((a, b) => new Date(usageTimeline[a]!.timestamp).getTime() - new Date(usageTimeline[b]!.timestamp).getTime())

    const result: ChartDataItem[] = new Array(usageTimeline.length)
    let toolIndex = 0

    // 3. O(N) iteration over chronologically ordered usage points
    for (let i = 0; i < sortedIndices.length; i++) {
      const originalIdx = sortedIndices[i]!
      const currentU = usageTimeline[originalIdx]!
      const currentTimestamp = new Date(currentU.timestamp).getTime()

      // Determine interval start time based on chronologically previous point
      const prevTimestamp = i > 0
        ? new Date(usageTimeline[sortedIndices[i - 1]!]!.timestamp).getTime()
        : 0

      const relevantTools: ToolCallPoint[] = []
      // 4. Advance tool pointer (O(M) total across all iterations)
      while (toolIndex < sortedTools.length && sortedTools[toolIndex]!.parsedTimestamp <= currentTimestamp) {
        if (sortedTools[toolIndex]!.parsedTimestamp > prevTimestamp) {
          relevantTools.push(sortedTools[toolIndex]!)
        }
        toolIndex++
      }

      // Generate tool summary string
      let toolSummary = ''
      if (relevantTools.length > 0) {
        const counts = new Map<string, number>()
        for (const tool of relevantTools) {
          const name = tool.toolName || 'unknown'
          counts.set(name, (counts.get(name) || 0) + 1)
        }

        const sortedCounts = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
        const displayCount = Math.min(3, sortedCounts.length)
        const displayItems = sortedCounts.slice(0, displayCount).map(([name, count]) => {
          return count > 1 ? `${name} x${count}` : name
        })

        const remaining = sortedCounts.length - displayCount
        if (remaining > 0) {
          toolSummary = `${displayItems.join(', ')} +${remaining} more`
        } else {
          toolSummary = displayItems.join(', ')
        }
      }

      // 5. Place result back into original array order
      result[originalIdx] = {
        relativeTime: formatRelativeTime(currentU.timestamp, sessionStartedAt),
        input: currentU.inputTokens,
        output: currentU.outputTokens,
        cost: currentU.estimatedCostUsd,
        model: currentU.model,
        toolSummary,
      }
    }

    return result
  }, [usageTimeline, sessionStartedAt, toolCalls])

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
