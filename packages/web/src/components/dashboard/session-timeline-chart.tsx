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

interface ToolCallPoint {
  timestamp: string
  parsedTimestamp: number
  toolName: string
}

interface ChartDataItem {
  relativeTime: string
  input: number
  output: number
  cost: number
  model?: string | null
  toolSummary: string
}

// ⚡ Bolt Optimization:
// 병목 지점: 기존 `getToolSummaryForIndex`는 N개의 항목마다 M개의 `toolCalls`를 `filter()`로 순회하여 O(N*M)의 시간 복잡도를 가졌습니다. 또한 반복적인 `new Date().getTime()` 호출로 파싱 오버헤드가 발생했습니다.
// 최적화 방법: 타임스탬프를 미리 파싱(O(N+M))하고, 배열을 정렬한 뒤 투 포인터 방식을 사용하여 O(N+M) 단일 루프로 툴 요약 문자열을 생성합니다.
// 기대 효과: 파싱 오버헤드를 O(1)로 줄이고, 루프 비용을 O(N*M)에서 O(N+M)으로 획기적으로 개선하여 렌더링 성능을 높이고 메인 스레드 지연을 방지합니다.
function buildChartData(
  usageTimeline: SessionTimelineUsage[],
  rawToolCalls: ToolCallPoint[],
  sessionStartedAt: string
): ChartDataItem[] {
  // Pre-parse timestamps
  const usageWithTime = usageTimeline.map(u => ({
    ...u,
    parsedTimestamp: Date.parse(u.timestamp)
  }))
  const toolsWithTime = rawToolCalls.map(t => ({
    ...t,
    parsedTimestamp: Date.parse(t.timestamp)
  }))

  // Ensure sorting by time to correctly use two-pointer logic
  usageWithTime.sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)
  toolsWithTime.sort((a, b) => a.parsedTimestamp - b.parsedTimestamp)

  const chartData: ChartDataItem[] = []
  let toolIndex = 0

  for (let i = 0; i < usageWithTime.length; i++) {
    const u = usageWithTime[i]!
    const currentTimestamp = u.parsedTimestamp
    const counts = new Map<string, number>()

    // Consume tools that fall on or before the current usage timestamp
    while (toolIndex < toolsWithTime.length && toolsWithTime[toolIndex]!.parsedTimestamp <= currentTimestamp) {
      const name = toolsWithTime[toolIndex]!.toolName
      counts.set(name, (counts.get(name) || 0) + 1)
      toolIndex++
    }

    let toolSummary = ''
    if (counts.size > 0) {
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

    chartData.push({
      relativeTime: formatRelativeTime(u.timestamp, sessionStartedAt),
      input: u.inputTokens,
      output: u.outputTokens,
      cost: u.estimatedCostUsd,
      model: u.model,
      toolSummary
    })
  }

  return chartData
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

  const toolCalls: ToolCallPoint[] = messages
    .filter((m) => m.role === 'TOOL')
    .map((m) => ({ timestamp: m.timestamp, parsedTimestamp: 0, toolName: m.toolName ?? 'unknown' }))

  const chartData = buildChartData(usageTimeline, toolCalls, sessionStartedAt)

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
