/** @vitest-environment jsdom */

import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ToolEvent } from '@/lib/timeline-events'
import { EventList } from './event-list'

vi.mock('react-window', async () => {
  const ReactModule = await import('react')

  return {
    List: ({
      rowComponent: Row,
      rowCount,
      rowProps,
    }: {
      rowComponent: React.ElementType
      rowCount: number
      rowProps: Record<string, unknown>
    }) =>
      ReactModule.createElement(
        'div',
        null,
        Array.from({ length: rowCount }, (_, index) =>
          ReactModule.createElement(Row, {
            ...rowProps,
            index,
            key: index,
            style: {},
          }),
        ),
      ),
  }
})

const toolEvent = (sequence: number): ToolEvent => ({
  kind: 'tool',
  toolName: 'Read',
  toolInput: { path: `file-${sequence}.txt` },
  content: 'ok',
  durationMs: 10,
  timestamp: `2026-09-20T00:00:0${sequence}Z`,
  sequence,
  isSkillCall: false,
  skillName: null,
  isAgentCall: false,
  agentType: null,
})

describe('EventList group disclosure', () => {
  afterEach(cleanup)

  /**
   * Preserves the virtualized group button's disclosure state and action while
   * keeping its Chevron out of the accessible name.
   */
  it('toggles a collapsed tool group through its labeled parent button', async () => {
    const user = userEvent.setup()
    const onToggleGroup = vi.fn()
    const events = [toolEvent(1), toolEvent(2)]

    render(
      <EventList
        events={events}
        groups={[
          {
            kind: 'toolRun',
            toolName: 'Read',
            items: [
              { event: events[0], idx: 0 },
              { event: events[1], idx: 1 },
            ],
          },
        ]}
        selectedIdx={-1}
        onSelect={vi.fn()}
        sessionStartedAt="2026-09-20T00:00:00Z"
        expandedGroups={new Set()}
        onToggleGroup={onToggleGroup}
      />,
    )

    const disclosure = screen.getByRole('button', { name: /Read x2/ })

    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    await user.click(disclosure)
    expect(onToggleGroup).toHaveBeenCalledTimes(1)
    expect(onToggleGroup).toHaveBeenCalledWith(0)
  })
})
