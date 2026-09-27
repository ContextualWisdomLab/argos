/** @vitest-environment jsdom */
import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { EventList } from './event-list';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('EventList group disclosure', () => {
  it('toggles a collapsed tool group through its labeled parent button', async () => {
    const user = userEvent.setup();
    const onToggleGroup = vi.fn();
    const events = [
      { kind: 'tool', timestamp: '2026-09-27T00:00:00Z', toolName: 'my_tool' },
      { kind: 'tool', timestamp: '2026-09-27T00:00:01Z', toolName: 'my_tool' }
    ];
    const groups = [
      {
        kind: 'group',
        toolName: 'my_tool',
        idx: 0,
        items: [
          { event: events[0], idx: 0 },
          { event: events[1], idx: 1 },
        ]
      }
    ];

    render(
      <EventList
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        events={events as any}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        groups={groups as any}
        selectedIdx={-1}
        onSelect={vi.fn()}
        sessionStartedAt="2026-09-27T00:00:00Z"
        expandedGroups={new Set()}
        onToggleGroup={onToggleGroup}
      />
    );

    // Assert tool group header exists
    const groupButton = screen.getByRole('button');
    expect(groupButton).toBeInTheDocument();
    expect(groupButton).toHaveAttribute('aria-expanded', 'false');

    // Assert Chevron icon is hidden from SR
    const chevronIcon = groupButton.querySelector('svg.lucide-chevron-right');
    expect(chevronIcon).toBeInTheDocument();
    expect(chevronIcon).toHaveAttribute('aria-hidden', 'true');

    await user.click(groupButton);
    expect(onToggleGroup).toHaveBeenCalledWith(0);
  });
});
