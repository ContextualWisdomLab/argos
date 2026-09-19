/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { EventDetail } from "./event-detail";

describe("EventDetail empty state", () => {
  afterEach(cleanup);

  /**
   * Preserves the exact next-action copy, visual hierarchy, and decorative
   * icon semantics when no timeline event is selected.
   */
  it("guides the next action without exposing its decorative icon", () => {
    const { container } = render(<EventDetail event={null} />);

    expect(screen.getByText("No event selected")).toHaveClass("font-bold");
    expect(
      screen.getByText("Select an event from the timeline to see details."),
    ).toBeInTheDocument();
    expect(
      container.querySelector('svg[aria-hidden="true"]'),
    ).toBeInTheDocument();
  });
});
