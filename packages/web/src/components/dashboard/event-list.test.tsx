/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventList } from "./event-list";
import type { TimelineEvent, TimelineGroup } from "@/lib/timeline-events";

vi.mock("react-window", () => ({
  List: ({
    rowComponent: RowComponent,
    rowCount,
    rowProps,
  }: {
    rowComponent: any;
    rowCount: number;
    rowProps: any;
  }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: rowCount }).map((_, index) => (
        <RowComponent
          key={index}
          index={index}
          style={{}}
          data={rowProps}
          {...rowProps}
        />
      ))}
    </div>
  ),
}));

describe("EventList", () => {
  const dummySessionStartedAt = "2024-05-24T10:00:00Z";

  it("renders empty state when no events", () => {
    render(
      <EventList
        events={[]}
        groups={[]}
        selectedIdx={0}
        onSelect={() => {}}
        sessionStartedAt={dummySessionStartedAt}
        expandedGroups={new Set()}
        onToggleGroup={() => {}}
      />,
    );
    expect(screen.getByText("No events recorded")).toBeDefined();
  });

  it("renders virtualized list correctly with single event", () => {
    const singleEvent: TimelineEvent = {
      kind: "message",
      id: "m-1",
      sessionId: "s-1",
      role: "HUMAN",
      content: "Hello",
      timestamp: "2024-05-24T10:01:00Z",
    };

    const groups: TimelineGroup[] = [
      {
        kind: "single",
        idx: 0,
        event: singleEvent,
      },
    ];

    render(
      <EventList
        events={[singleEvent]}
        groups={groups}
        selectedIdx={0}
        onSelect={() => {}}
        sessionStartedAt={dummySessionStartedAt}
        expandedGroups={new Set()}
        onToggleGroup={() => {}}
      />,
    );

    expect(screen.getByTestId("virtualized-list")).toBeDefined();
    // 1 minute elapsed since 10:00:00 -> "0:01:00" format in the logic
    expect(screen.getByText("0:01:00")).toBeDefined();
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("User")).toBeDefined();
  });
});
