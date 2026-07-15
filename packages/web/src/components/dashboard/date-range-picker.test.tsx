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
    render(<DateRangePicker />);

    const button7d = screen.getByRole("button", { name: "Select 7d range" });
    expect(button7d.hasAttribute("aria-pressed")).toBe(true);
  });
});
