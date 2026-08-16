/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "./date-range-picker";
import { cleanup } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => {
  return {
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

describe("DateRangePicker", () => {
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    // Default search params
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders presets", () => {
    render(<DateRangePicker />);

    expect(screen.getByRole("button", { name: "7d" })).toBeDefined();
    expect(screen.getByRole("button", { name: "30d" })).toBeDefined();
    expect(screen.getByRole("button", { name: "90d" })).toBeDefined();
    expect(screen.getByRole("button", { name: "ALL" })).toBeDefined();
  });

  it("updates URL when a preset is clicked", () => {
    render(<DateRangePicker />);

    const button30d = screen.getByRole("button", { name: "30d" });
    fireEvent.click(button30d);

    expect(mockPush).toHaveBeenCalledTimes(1);

    // Check if the URL contains from and to parameters
    const calledUrl = mockPush.mock.calls[0][0];
    expect(calledUrl).toContain("from=");
    expect(calledUrl).toContain("to=");
  });

  it("has aria-pressed set correctly based on active state", () => {
    render(<DateRangePicker />);

    const button7d = screen.getByRole("button", { name: "7d" });
    expect(button7d.hasAttribute("aria-pressed")).toBe(true);
  });

  it("names the preset group and keeps each visible abbreviation in its accessible name", () => {
    render(<DateRangePicker />);

    const group = screen.getByRole("group", { name: "Date range presets" });
    const expectedNames = [
      [/^7d\b.*last 7 days/i, "7d"],
      [/^30d\b.*last 30 days/i, "30d"],
      [/^90d\b.*last 90 days/i, "90d"],
      [/^ALL\b.*all available history/i, "ALL"],
    ] as const;

    for (const [name, visibleLabel] of expectedNames) {
      const button = within(group).getByRole("button", { name });
      expect(button.textContent).toContain(visibleLabel);
    }
  });
});
