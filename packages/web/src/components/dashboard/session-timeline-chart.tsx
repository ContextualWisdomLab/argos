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

// ⚡ Bolt: O(N*M) 필터를 제거하고 투 포인터(Two-pointer)를 사용하여
// 타임라인과 도구 호출 데이터를 O(N+M)으로 병합하는 최적화된 함수
function getToolSummaries(
  usageTimeline: SessionTimelineUsage[],
  toolCalls: ToolCallPoint[]
): string[] {
  if (usageTimeline.length === 0) return []
  if (toolCalls.length === 0) return new Array(usageTimeline.length).fill('')

  const summaries: string[] = new Array(usageTimeline.length).fill('')
  let toolIdx = 0
  const totalTools = toolCalls.length

  for (let i = 0; i < usageTimeline.length; i++) {
    const currentTimestamp = new Date(usageTimeline[i]!.timestamp).getTime()
    const prevTimestamp = i > 0 ? new Date(usageTimeline[i - 1]!.timestamp).getTime() : 0

    const counts = new Map<string, number>()
    let toolsInBucket = 0

    while (toolIdx < totalTools) {
      const tool = toolCalls[toolIdx]!
      if (tool.parsedTimestamp <= prevTimestamp) {
        toolIdx++
        continue
      }
      if (tool.parsedTimestamp > currentTimestamp) {
        break
      }
      const name = tool.toolName || 'unknown'
      counts.set(name, (counts.get(name) || 0) + 1)
      toolsInBucket++
      toolIdx++
    }

    if (toolsInBucket === 0) continue

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
    const displayCount = Math.min(3, sorted.length)
    const displayItems = sorted.slice(0, displayCount).map(([name, count]) => {
      return count > 1 ? `${name} x${count}` : name
    })

    const remaining = sorted.length - displayCount
    if (remaining > 0) {
      summaries[i] = `${displayItems.join(', ')} +${remaining} more`
    } else {
      summaries[i] = displayItems.join(', ')
    }
  }

  return summaries
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
      .sort((a, b) => a.parsedTimestamp - b.parsedTimestamp) // ⚡ Bolt: 투 포인터를 위해 정렬 보장
  }, [messages])

  // ⚡ Bolt: usageTimeline 배열을 순회하며 차트 데이터를 생성하는 비용이 높은 작업을
  // useMemo로 최적화하여 데이터 변경이 없을 때 캐시된 결과를 재사용함.
  // 이로 인해 리렌더링 속도가 향상됨.
  const chartData: ChartDataItem[] = useMemo(() => {
    const toolSummaries = getToolSummaries(usageTimeline, toolCalls) // ⚡ Bolt: 단일 패스 생성
    return usageTimeline.map((u, idx) => ({
      relativeTime: formatRelativeTime(u.timestamp, sessionStartedAt),
      input: u.inputTokens,
      output: u.outputTokens,
      cost: u.estimatedCostUsd,
      model: u.model,
      toolSummary: toolSummaries[idx] || '',
    }))
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
