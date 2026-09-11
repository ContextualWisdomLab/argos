import { format as dateFnsFormat, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`
  }
  return n.toLocaleString()
}

export function formatCost(usd: number): string {
  if (usd >= 1) {
    return `$${usd.toFixed(2)}`
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(3)}`
  }
  return `$${usd.toFixed(4)}`
}

export function formatDate(s: string): string {
  try {
    const date = new Date(s)
    return dateFnsFormat(date, 'MMM d')
  } catch {
    return s
  }
}

export function formatDateTime(s: string): string {
  try {
    const date = new Date(s)
    if (Number.isNaN(date.getTime())) return s
    return dateFnsFormat(date, 'MM/dd/yyyy h:mm:ss a')
  } catch {
    return s
  }
}

// 2026-04-13 16:29:29 형태
export function formatDateTimeFull(s: string): string {
  try {
    const date = new Date(s)
    if (Number.isNaN(date.getTime())) return s
    return dateFnsFormat(date, 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return s
  }
}

/**
 * Format a timestamp as relative time.
 * - With `baseTimestamp`: offset from base (e.g. "+3m", "+1h 5m").
 * - Without: distance-to-now (e.g. "2 minutes ago").
 */
export function formatRelativeTime(timestamp: string): string
export function formatRelativeTime(timestamp: string, baseTimestamp: string): string
export function formatRelativeTime(timestamp: string, baseTimestamp?: string): string {
  if (baseTimestamp === undefined) {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ko })
    } catch {
      return timestamp
    }
  }

  const timestampDate = new Date(timestamp)
  const baseDate = new Date(baseTimestamp)
  const diffMs = timestampDate.getTime() - baseDate.getTime()
  const totalMinutes = Math.floor(diffMs / 60000)

  if (totalMinutes < 60) {
    return `+${totalMinutes}m`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `+${hours}h ${minutes}m`
}

/**
 * Format an event timestamp as a non-negative `hours:mm:ss` session offset.
 *
 * The caller supplies the already-parsed session anchor so a virtualized list
 * can reuse one primitive value across every visible row.
 */
export function formatElapsedHms(timestamp: string, sessionStartedAtMs: number): string {
  const timestampMs = Date.parse(timestamp)
  if (Number.isNaN(timestampMs) || Number.isNaN(sessionStartedAtMs)) return ''

  const diffSeconds = Math.max(0, Math.floor((timestampMs - sessionStartedAtMs) / 1000))
  const hours = Math.floor(diffSeconds / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * < 24h → relative ("20시간 전"), 그 이상 → "yyyy-MM-dd HH:mm:ss".
 * 정확한 시각은 hover 등 title 속성에 별도로 넣어 보조한다.
 */
export function formatLastUsed(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso)
  if (diffMs < ONE_DAY_MS) {
    return formatRelativeTime(iso)
  }
  return formatDateTimeFull(iso)
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
  return `${Math.round(ms / 60_000)}min`
}

export function formatDuration(startedAt: string, endedAt?: string | null): string {
  const start = Date.parse(startedAt)
  const end = endedAt ? Date.parse(endedAt) : Date.now()
  const diffMs = Math.max(0, end - start)

  if (diffMs < 1000) return '0s'

  const totalSeconds = Math.floor(diffMs / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`

  const totalMinutes = Math.floor(totalSeconds / 60)
  if (totalMinutes < 60) return `${totalMinutes}m`

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}
