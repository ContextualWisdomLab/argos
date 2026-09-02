/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { TimelineEvent, TimelineGroup } from '@/lib/timeline-events'
import { SessionActivityRibbon } from './session-activity-ribbon'

const events: TimelineEvent[] = [
  {
    kind: 'message',
    role: 'HUMAN',
    content: 'Inspect the current state',
    timestamp: '2026-08-16T00:00:00.000Z',
    sequence: 1,
    outputTokens: 0,
    inputTokens: 0,
    estimatedCostUsd: 0,
    model: null,
  },
  {
    kind: 'tool',
    toolName: 'Read',
    toolInput: null,
    content: '',
    durationMs: 10,
    timestamp: '2026-08-16T00:00:01.000Z',
    sequence: 2,
    isSkillCall: false,
    skillName: null,
    isAgentCall: false,
    agentType: null,
  },
  {
    kind: 'tool',
    toolName: 'Read',
    toolInput: null,
    content: '',
    durationMs: 10,
    timestamp: '2026-08-16T00:00:02.000Z',
    sequence: 3,
    isSkillCall: false,
    skillName: null,
    isAgentCall: false,
    agentType: null,
  },
]

const groups: TimelineGroup[] = [
  { kind: 'single', event: events[0], idx: 0 },
  {
    kind: 'toolRun',
    toolName: 'Read',
    items: [
      { event: events[1] as Extract<TimelineEvent, { kind: 'tool' }>, idx: 1 },
      { event: events[2] as Extract<TimelineEvent, { kind: 'tool' }>, idx: 2 },
    ],
  },
]

function renderRibbon(selectedIdx: number | null, onToggleGroup = vi.fn()) {
  return render(
    <SessionActivityRibbon
      events={events}
      groups={groups}
      selectedIdx={selectedIdx}
      onSelect={vi.fn()}
      sessionStartedAt="2026-08-16T00:00:00.000Z"
      expandedGroups={new Set<number>()}
      onToggleGroup={onToggleGroup}
    />
  )
}

function currentEventButtons() {
  return screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-current') === 'true')
}

describe('SessionActivityRibbon accessibility semantics', () => {

  it('identifies Agent message aria label', () => {
    const agentEvents = [
      {
        kind: 'message',
        role: 'ASSISTANT',
        content: 'I will list the files',
        timestamp: '2026-08-16T00:00:10.000Z',
        sequence: 2,
        inputTokens: 10,
        outputTokens: 20,
        estimatedCostUsd: 0.0001,
        model: 'claude',
      },
    ];
    const agentGroups = [
      {
        kind: 'single',
        event: agentEvents[0],
        idx: 0,
      }
    ];
    const { getByRole } = render(
      <SessionActivityRibbon
        events={agentEvents as unknown as TimelineEvent[]}
        groups={agentGroups as unknown as TimelineGroup[]}
        selectedIdx={null}
        onSelect={vi.fn()}
        sessionStartedAt="2026-08-16T00:00:00.000Z"
        expandedGroups={new Set()}
        onToggleGroup={vi.fn()}
      />
    )
    expect(getByRole('button', { name: 'Agent message 1' })).toBeInTheDocument();
  })

  it('identifies Skill and Subagent aria label', () => {
    const toolEvents = [
      {
        kind: 'tool',
        toolName: 'Skill',
        isSkillCall: true,
        skillName: 'list_files',
        isAgentCall: false,
        agentType: null,
        durationMs: 100,
        timestamp: '2026-08-16T00:00:15.000Z',
      },
      {
        kind: 'tool',
        toolName: 'Agent',
        isSkillCall: false,
        skillName: null,
        isAgentCall: true,
        agentType: 'coder',
        durationMs: 100,
        timestamp: '2026-08-16T00:00:16.000Z',
      },
      {
        kind: 'tool',
        toolName: 'read_file',
        isSkillCall: false,
        skillName: null,
        isAgentCall: false,
        agentType: null,
        durationMs: 100,
        timestamp: '2026-08-16T00:00:17.000Z',
      }
    ];
    const toolGroups = [
      {
        kind: 'single',
        event: toolEvents[0],
        idx: 0,
      },
      {
        kind: 'single',
        event: toolEvents[1],
        idx: 1,
      },
      {
        kind: 'single',
        event: toolEvents[2],
        idx: 2,
      }
    ];
    const { getByRole } = render(
      <SessionActivityRibbon
        events={toolEvents as unknown as TimelineEvent[]}
        groups={toolGroups as unknown as TimelineGroup[]}
        selectedIdx={null}
        onSelect={vi.fn()}
        sessionStartedAt="2026-08-16T00:00:00.000Z"
        expandedGroups={new Set()}
        onToggleGroup={vi.fn()}
      />
    )
    expect(getByRole('button', { name: 'Skill list_files 1' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Subagent coder 2' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Tool read_file 3' })).toBeInTheDocument();
  })

  afterEach(cleanup)

  it('identifies exactly one visually current event without turning event actions into toggle buttons', () => {
    const { rerender } = renderRibbon(0)

    const firstEvent = screen.getByRole('button', { name: /User message 1:/ })
    expect(firstEvent).toHaveAttribute('aria-current', 'true')
    expect(firstEvent).not.toHaveAttribute('aria-pressed')
    expect(currentEventButtons()).toEqual([firstEvent])

    rerender(
      <SessionActivityRibbon
        events={events}
        groups={groups}
        selectedIdx={1}
        onSelect={vi.fn()}
        sessionStartedAt="2026-08-16T00:00:00.000Z"
        expandedGroups={new Set<number>()}
        onToggleGroup={vi.fn()}
      />
    )

    const secondEvent = screen.getByRole('button', { name: /Tool Read 2/ })
    expect(screen.getByRole('button', { name: /User message 1:/ })).not.toHaveAttribute('aria-current')
    expect(secondEvent).toHaveAttribute('aria-current', 'true')
    expect(currentEventButtons()).toEqual([secondEvent])
  })

  it('names a collapsed tool run by the next action instead of claiming a persistent disclosure state', () => {
    const onToggleGroup = vi.fn()
    renderRibbon(null, onToggleGroup)

    const expand = screen.getByRole('button', { name: 'Expand Read group, 2 events' })
    expect(expand).not.toHaveAttribute('aria-expanded')

    fireEvent.click(expand)
    expect(onToggleGroup).toHaveBeenCalledWith(1)
  })
})
