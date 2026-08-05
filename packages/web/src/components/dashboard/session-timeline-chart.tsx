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
  usageTimeline: readonly SessionTimelineUsage[]
  messages: readonly SessionDetail['messages'][number][]
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

function buildToolSummary(tools: ToolCallPoint[]): string {
  if (tools.length === 0) return ''

  // 이름별로 카운트
  const counts = new Map<string, number>()
  for (const tool of tools) {
    const name = tool.toolName || 'unknown'
    counts.set(name, (counts.get(name) || 0) + 1)
  }

  // 배열로 변환하여 1. 카운트 내림차순 2. 이름 알파벳 오름차순 정렬
  const sorted = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) {
        return b[1] - a[1]
    }
    return a[0].localeCompare(b[0])
  })

  // 최대 3개까지만 표시
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

export function SessionTimelineChart({
  usageTimeline,
  messages,
  sessionStartedAt,
}: SessionTimelineChartProps) {
  // ⚡ Bolt: usageTimeline과 messages 데이터는 보통 시간순으로 들어오지만,
  // 안전하게 O(N+M) 투 포인터 알고리즘을 사용하기 위해 두 배열 모두 명시적으로 시간순 정렬합니다.
  const sortedToolCalls: ToolCallPoint[] = useMemo(() => {
    return messages
      .filter((m) => m.role === 'TOOL')
      .map((m) => ({
        timestamp: m.timestamp,
        toolName: m.toolName ?? 'unknown',
        parsedTimestamp: new Date(m.timestamp).getTime(),
      }))
      .sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)
  }, [messages])

  // ⚡ Bolt: 기존 O(N*M) nested loop(.map 안의 .filter)를 O(N+M) 투 포인터 접근법으로 최적화하여
  // 리렌더링 속도와 대규모 데이터셋 처리 성능을 크게 향상함.
  const chartData: ChartDataItem[] = useMemo(() => {
    if (usageTimeline.length === 0) return []

    // 시간순으로 정렬된 복사본 생성 (입력 배열 불변성 유지)
    const sortedUsage = [...usageTimeline].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    let toolIndex = 0
    const result: ChartDataItem[] = []
    let prevTimestamp = 0

    for (const u of sortedUsage) {
      const currentTimestamp = new Date(u.timestamp).getTime()

      const relevantTools: ToolCallPoint[] = []
      // 투 포인터: toolCalls는 이미 정렬되어 있으므로, 인덱스를 계속 전진시킴
      while (
        toolIndex < sortedToolCalls.length &&
        sortedToolCalls[toolIndex]!.parsedTimestamp <= currentTimestamp
      ) {
        if (sortedToolCalls[toolIndex]!.parsedTimestamp > prevTimestamp) {
          relevantTools.push(sortedToolCalls[toolIndex]!)
        }
        toolIndex++
      }

      result.push({
        relativeTime: formatRelativeTime(u.timestamp, sessionStartedAt),
        input: u.inputTokens,
        output: u.outputTokens,
        cost: u.estimatedCostUsd,
        model: u.model,
        toolSummary: buildToolSummary(relevantTools),
      })

      prevTimestamp = currentTimestamp
    }

    return result
  }, [usageTimeline, sessionStartedAt, sortedToolCalls])

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
