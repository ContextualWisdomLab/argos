import { BarChart3 } from 'lucide-react'

interface EmptyWeekStateProps {
  title?: string
  message: string
  action?: React.ReactNode
}

/**
 * Renders the weekly report empty state with an actionable message and optional action.
 */
export function EmptyWeekState({
  title = '데이터 없음',
  message,
  action,
}: EmptyWeekStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-card ring-1 ring-foreground/10 p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground mb-4">{message}</p>
      {action}
    </div>
  )
}