import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Labels and pending flag for a mutation control that keeps native button
 * semantics on the owner.
 */
export interface PendingActionLabelProps {
  /** True while the owning mutation is in flight. */
  pending: boolean
  /** Accessible name shown when the action is idle. */
  idleLabel: string
  /** Accessible name shown while the mutation is in flight. */
  pendingLabel: string
}

/**
 * Render a stable action label with a decorative, reduced-motion-aware spinner.
 *
 * The owning interactive control remains responsible for its disabled and
 * `aria-busy` states so native button semantics stay authoritative.
 *
 * @param pending - Whether the owning mutation is in flight
 * @param idleLabel - Button name while idle
 * @param pendingLabel - Button name while the mutation is in flight
 * @returns The idle string, or a decorative spinner plus the pending label
 */
export function PendingActionLabel({
  pending,
  idleLabel,
  pendingLabel,
}: PendingActionLabelProps): React.ReactNode {
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
