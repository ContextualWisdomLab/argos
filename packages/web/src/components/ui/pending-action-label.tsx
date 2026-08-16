import React from 'react'
import { Loader2 } from 'lucide-react'

interface PendingActionLabelProps {
  pending: boolean
  idleLabel: string
  pendingLabel: string
}

/**
 * Render a stable action label with a decorative, reduced-motion-aware spinner.
 *
 * The owning interactive control remains responsible for its disabled and
 * `aria-busy` states so native button semantics stay authoritative.
 */
export function PendingActionLabel({
  pending,
  idleLabel,
  pendingLabel,
}: PendingActionLabelProps) {
  if (!pending) return idleLabel

  return (
    <>
      <Loader2
        className="mr-2 h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
        focusable="false"
      />
      {pendingLabel}
    </>
  )
}
