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
    // ⚡ Bolt: .filter()와 .map() 체이닝을 단일 for...of 루프로 결합하여
    // 불필요한 중간 배열 할당을 제거하고 O(K*N) 순회를 O(N)으로 최적화함.
    const calls: ToolCallPoint[] = []
    for (const m of messages) {
      if (m.role === 'TOOL') {
        calls.push({
          timestamp: m.timestamp,
          toolName: m.toolName ?? 'unknown',
          parsedTimestamp: new Date(m.timestamp).getTime(),
        })
      }
    }
    return calls
  }, [messages])

  // ⚡ Bolt: usageTimeline 배열을 순회하며 차트 데이터를 생성하는 비용이 높은 작업을
  // useMemo로 최적화하여 데이터 변경이 없을 때 캐시된 결과를 재사용함.
  // 이로 인해 리렌더링 속도가 향상됨.
  const chartData: ChartDataItem[] = useMemo(() => {
    // ⚡ Bolt: O(N*M) 중첩 루프를 O(N+M) 투 포인터 방식으로 최적화하여 렌더링 성능을 개선함.
    // 타임라인과 도구 호출 배열을 시간순으로 정렬한 후 한 번의 순회로 매칭함.

    const parsedTimeline = usageTimeline.map(u => ({
      ...u,
      parsedTimestamp: new Date(u.timestamp).getTime()
    })).sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)

    const sortedTools = [...toolCalls].sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)

    let toolIdx = 0
    const toolLen = sortedTools.length

    return parsedTimeline.map((u, idx) => {
      const currentTimestamp = u.parsedTimestamp
      const prevTimestamp = idx > 0 ? parsedTimeline[idx - 1].parsedTimestamp : 0

      const relevantTools: ToolCallPoint[] = []

      while (toolIdx < toolLen && sortedTools[toolIdx].parsedTimestamp <= prevTimestamp) {
        toolIdx++
      }

      let currentToolIdx = toolIdx
      while (currentToolIdx < toolLen && sortedTools[currentToolIdx].parsedTimestamp <= currentTimestamp) {
        relevantTools.push(sortedTools[currentToolIdx])
        currentToolIdx++
      }
      toolIdx = currentToolIdx

      let toolSummary = ''
      if (relevantTools.length > 0) {
        const counts = new Map<string, number>()
        for (const tool of relevantTools) {
          const name = tool.toolName || 'unknown'
          counts.set(name, (counts.get(name) || 0) + 1)
        }

        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
        const displayCount = Math.min(3, sorted.length)
        const displayItems = sorted.slice(0, displayCount).map(([name, count]) => {
          return count > 1 ? `${name} x${count}` : name
        })

        const remaining = sorted.length - displayCount
        if (remaining > 0) {
          toolSummary = `${displayItems.join(', ')} +${remaining} more`
        } else {
          toolSummary = displayItems.join(', ')
        }
      }

      return {
        relativeTime: formatRelativeTime(u.timestamp, sessionStartedAt),
        input: u.inputTokens,
        output: u.outputTokens,
        cost: u.estimatedCostUsd,
        model: u.model,
        toolSummary,
      }
    })
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
