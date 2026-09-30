/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { EventList } from './event-list'
import type { TimelineEvent, TimelineGroup } from '@/lib/timeline-events'

globalThis.React = React;
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('react-window', async () => {
  const actual = await vi.importActual('react-window');
  return {
    ...actual as Record<string, unknown>,
    List: ({ rowCount, rowComponent: Row, rowProps }: { rowCount: number, rowComponent: React.ComponentType<unknown>, rowProps: Record<string, unknown> }) => (
      <div>
        {Array.from({ length: rowCount }).map((_, index) => (
          <Row key={index} index={index} style={{}} data={rowProps} {...rowProps} />
        ))}
      </div>
    )
  };
});

describe('EventList', () => {
  it('includes aria-hidden="true" on decorative icons within groups', () => {
    const mockEvent: TimelineEvent = {
      kind: 'tool',
      durationMs: 1000,
      sequence: 1,
      toolInput: '{}',
      skillName: null,
      agentType: null,
      timestamp: '2023-01-01T12:00:00Z',
      toolName: 'TestTool',
      content: 'tool execution',
      isAgentCall: false,
      isSkillCall: false,
    }
    const mockGroup: TimelineGroup = {
      kind: 'toolRun',
      toolName: 'TestTool',
      items: [
        { idx: 0, event: mockEvent },
        { idx: 1, event: mockEvent },
      ]
    }
    const expandedGroups = new Set([0])

    const { container } = render(
      <div style={{ height: '500px', width: '500px' }}>
        <EventList
          events={[mockEvent, mockEvent]}
          groups={[mockGroup]}
          selectedIdx={-1}
          onSelect={() => {}}
          sessionStartedAt="2023-01-01T12:00:00Z"
          expandedGroups={expandedGroups}
          onToggleGroup={() => {}}
        />
      </div>
    )

    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-right')
    expect(chevronIcons.length).toBeGreaterThan(0)
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
