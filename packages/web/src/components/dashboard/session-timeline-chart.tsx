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

function formatToolSummary(relevantTools: ToolCallPoint[]): string {
  if (relevantTools.length === 0) return ''

  // 이름별로 카운트
  const counts: Record<string, number> = {}
  for (let i = 0; i < relevantTools.length; i++) {
    const name = relevantTools[i]!.toolName || 'unknown'
    counts[name] = (counts[name] || 0) + 1
  }

  // Object.keys()를 사용하여 가비지 컬렉션 오버헤드 감소
  const keys = Object.keys(counts)
  keys.sort((a, b) => counts[b]! - counts[a]!)

  // 최대 3개까지만 표시
  const displayCount = Math.min(3, keys.length)
  const displayItems = []
  for (let i = 0; i < displayCount; i++) {
    const name = keys[i]!
    const count = counts[name]!
    displayItems.push(count > 1 ? `${name} x${count}` : name)
  }

  const remaining = keys.length - displayCount
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
      .sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)
  }, [messages])

  // ⚡ Bolt: O(N*M) 복잡도의 중첩 필터링을 방지하기 위해 배열을 시간순으로 정렬한 후,
  // 포인터를 사용하여 O(N+M) 복잡도로 최적화함. (리렌더링 지연시간 대폭 감소)
  const chartData: ChartDataItem[] = useMemo(() => {
    const sortedUsage = [...usageTimeline].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    const data: ChartDataItem[] = []
    let toolIndex = 0
    let prevTimestamp = 0

    for (let i = 0; i < sortedUsage.length; i++) {
      const u = sortedUsage[i]!
      const currentTimestamp = new Date(u.timestamp).getTime()

      // prevTimestamp 이하인 툴은 무시
      while (toolIndex < toolCalls.length && toolCalls[toolIndex]!.parsedTimestamp <= prevTimestamp) {
        toolIndex++
      }

      const relevantTools: ToolCallPoint[] = []
      // currentTimestamp 이하인 툴들을 수집
      while (toolIndex < toolCalls.length && toolCalls[toolIndex]!.parsedTimestamp <= currentTimestamp) {
        relevantTools.push(toolCalls[toolIndex]!)
        toolIndex++
      }

      data.push({
        relativeTime: formatRelativeTime(u.timestamp, sessionStartedAt),
        input: u.inputTokens,
        output: u.outputTokens,
        cost: u.estimatedCostUsd,
        model: u.model,
        toolSummary: formatToolSummary(relevantTools),
      })

      prevTimestamp = currentTimestamp
    }

    return data
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
