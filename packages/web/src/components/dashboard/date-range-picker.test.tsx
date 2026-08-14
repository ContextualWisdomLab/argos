/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

    expect(screen.getByRole("button", { name: "Select 7d range" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Select 30d range" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Select 90d range" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Select ALL range" })).toBeDefined();
  });

  it("updates URL when a preset is clicked", () => {
    render(<DateRangePicker />);

    const button30d = screen.getByRole("button", { name: "Select 30d range" });
    fireEvent.click(button30d);

    expect(mockPush).toHaveBeenCalledTimes(1);

    // Check if the URL contains from and to parameters
    const calledUrl = mockPush.mock.calls[0][0];
    expect(calledUrl).toContain("from=");
    expect(calledUrl).toContain("to=");
  });

  it("has aria-pressed set correctly based on active state", () => {
    // mock subDays and differenceInDays for stable testing
    vi.setSystemTime(new Date(2024, 0, 15)); // Jan 15, 2024

    // Simulate active preset logic (7d difference from Jan 15 is Jan 8 -> differenceInDays is 7, active preset logic is differenceInDays === 6 ?? 7?? Ah `differenceInDays` behaves differently depending on the time of day, but the implementation is `differenceInDays(toDate, fromDate)` where `fromDate` is `subDays(today, 7)` which gives exactly 7 days difference.)
    // Wait, the implementation says `daysDiff === 6 ? 7`. Let's mock the difference to be 6 for 7d preset.
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("from", "2024-01-09"); // 6 days diff = active 7d preset
    mockSearchParams.set("to", "2024-01-15");
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    render(<DateRangePicker />);

    const button7d = screen.getByRole("button", { name: "Select 7d range" });
    expect(button7d.getAttribute("aria-pressed")).toBe("true");

    const button30d = screen.getByRole("button", { name: "Select 30d range" });
    expect(button30d.getAttribute("aria-pressed")).toBe("false");

    vi.useRealTimers();
  });
});
