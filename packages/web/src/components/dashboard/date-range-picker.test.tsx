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

    expect(screen.getByRole("button", { name: "Select the last 7 days" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Select the last 30 days" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Select the last 90 days" })).toBeDefined();
    const allDates = screen.getByRole("button", { name: "Select all available dates" });
    expect(allDates).toBeDefined();
    expect(allDates.getAttribute("title")).toBe("Select all available dates");
  });

  it("updates URL when a preset is clicked", () => {
    render(<DateRangePicker />);

    const button30d = screen.getByRole("button", { name: "Select the last 30 days" });
    fireEvent.click(button30d);

    expect(mockPush).toHaveBeenCalledTimes(1);

    // Check if the URL contains from and to parameters
    const calledUrl = mockPush.mock.calls[0][0];
    expect(calledUrl).toContain("from=");
    expect(calledUrl).toContain("to=");
  });

  it("sets aria-pressed to the exact active and inactive states", () => {
    render(<DateRangePicker />);

    const button7d = screen.getByRole("button", { name: "Select the last 7 days" });
    const button30d = screen.getByRole("button", { name: "Select the last 30 days" });
    expect(button7d.getAttribute("aria-pressed")).toBe("true");
    expect(button30d.getAttribute("aria-pressed")).toBe("false");
  });
});
