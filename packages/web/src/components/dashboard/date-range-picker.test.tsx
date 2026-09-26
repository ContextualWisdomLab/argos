/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "./date-range-picker";
import { cleanup } from "@testing-library/react";
import { subDays, format } from "date-fns";

// Mock next/navigation
vi.mock("next/navigation", () => {
  return {
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

describe("DateRangePicker", () => {
  let mockPush: ReturnType<typeof vi.fn>;
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 12, 0, 0));
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
    mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders presets", () => {
    render(<DateRangePicker />);

    expect(screen.getByRole("button", { name: "Last 7 days" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Last 30 days" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Last 90 days" })).toBeDefined();
    expect(screen.getByRole("button", { name: "All time" })).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Last 7 days" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("updates URL when a preset is clicked", () => {
    render(<DateRangePicker />);

    const button30d = screen.getByRole("button", { name: "Last 30 days" });
    fireEvent.click(button30d);

    expect(mockPush).toHaveBeenCalledTimes(1);

    expect(mockPush).toHaveBeenCalledWith("?from=2026-08-28&to=2026-09-26");
  });

  it("has aria-pressed set correctly based on active state", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 6), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);

    const button7d = screen.getByRole("button", { name: "Last 7 days" });
    expect(button7d.getAttribute("aria-pressed")).toBe("true");
  });

  it("has aria-pressed set correctly for 30d", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 29), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);
    const button30d = screen.getByRole("button", { name: "Last 30 days" });
    expect(button30d.getAttribute("aria-pressed")).toBe("true");
  });

  it("has aria-pressed set correctly for 90d", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 89), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);
    const button90d = screen.getByRole("button", { name: "Last 90 days" });
    expect(button90d.getAttribute("aria-pressed")).toBe("true");
  });

  it("has aria-pressed set correctly for ALL", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 3650), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);
    const buttonAll = screen.getByRole("button", { name: "All time" });
    expect(buttonAll.getAttribute("aria-pressed")).toBe("true");
  });

  it("returns null for activePreset if not today", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 8), 'yyyy-MM-dd'),
      to: format(subDays(today, 1), 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);
    const button7d = screen.getByRole("button", { name: "Last 7 days" });
    expect(button7d.getAttribute("aria-pressed")).toBe("false");
  });

  it("returns null for activePreset if unknown date range ending today", () => {
    const today = new Date();
    mockSearchParams = new URLSearchParams({
      from: format(subDays(today, 15), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    render(<DateRangePicker />);
    const button7d = screen.getByRole("button", { name: "Last 7 days" });
    expect(button7d.getAttribute("aria-pressed")).toBe("false");
  });
});
