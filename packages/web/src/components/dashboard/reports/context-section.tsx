'use client'

import React, { useState, useId, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function ContextSection({ title, children, defaultOpen = false }: ContextSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  const headerId = `context-header-${id}`
  const panelId = `context-panel-${id}`

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
      <button
        type="button"
        id={headerId}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'hover:bg-card-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        )}
        aria-expanded={open}
      >
        <h2 className="text-base font-medium">{title}</h2>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  )
}
