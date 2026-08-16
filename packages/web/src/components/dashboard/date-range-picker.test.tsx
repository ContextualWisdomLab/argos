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

  it("names the preset group and describes abbreviations without replacing visible button names", () => {
    render(<DateRangePicker />);

    expect(screen.getByRole("group", { name: "Date range presets" })).toBeDefined();
    const expectedDescriptions = [
      ["7d", "Last 7 days"],
      ["30d", "Last 30 days"],
      ["90d", "Last 90 days"],
      ["ALL", "All available history"],
    ] as const;

    for (const [name, description] of expectedDescriptions) {
      const button = screen.getByRole("button", { name });
      const descriptionId = button.getAttribute("aria-describedby");
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId!)?.textContent).toBe(description);
    }
  });
});
