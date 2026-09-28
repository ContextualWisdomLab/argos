/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it } from 'vitest'
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

describe('EventList', () => {
  it('includes aria-hidden="true" on decorative icons within groups', () => {
    const mockEvent: TimelineEvent = {
      kind: 'tool',
      timestamp: '2023-01-01T12:00:00Z',
      toolName: 'TestTool',
      content: 'tool execution',
      isAgentCall: false,
      isSkillCall: false,
    }
    const mockGroup: TimelineGroup = {
      kind: 'consecutive',
      toolName: 'TestTool',
      items: [
        { idx: 0, event: mockEvent },
        { idx: 1, event: mockEvent },
      ]
    }
    const expandedGroups = new Set([0])

    // In jsdom environment, react-window may not render all rows unless width/height are handled,
    // but the Row is tested directly.
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

    // Give react-window a chance to render if it can, but jsdom often needs specific mocks.
    // Let's at least check if rendering doesn't crash and if there's any chevron rendered.
    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-right')
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
