/* eslint-disable @typescript-eslint/no-explicit-any */
/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Fix for "React is not defined" error in underlying components
(global as any).React = React;
// Fix for "The current testing environment is not configured to support act(...)"
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

import { CopyPromptButton } from "./copy-prompt-button";

// Mock lucide-react icons to avoid React undefined issues
vi.mock("lucide-react", () => ({
  Check: ({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean | "true" | "false" }) => (
    <svg data-testid="check-icon" aria-hidden={ariaHidden} />
  ),
  Copy: ({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean | "true" | "false" }) => (
    <svg data-testid="copy-icon" aria-hidden={ariaHidden} />
  ),
}));

describe("CopyPromptButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders correctly with default props", () => {
    render(<CopyPromptButton text="test prompt" />);
    expect(screen.getByText("프롬프트 복사")).toBeInTheDocument();
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    expect(screen.getByTestId("copy-icon")).toHaveAttribute("aria-hidden", "true");
    const span = screen.getByText("프롬프트 복사").closest("span");
    expect(span).toHaveAttribute("aria-live", "polite");
  });

  it("renders correctly with custom props", () => {
    render(
      <CopyPromptButton
        text="test prompt"
        label="Custom Copy"
        copiedLabel="Custom Copied"
        className="custom-class"
      />
    );
    expect(screen.getByText("Custom Copy")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("handles copy click and state change", async () => {
    render(<CopyPromptButton text="test prompt" />);
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test prompt");
    expect(screen.getByText("복사됨")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toHaveAttribute("aria-hidden", "true");

    // Fast-forward time to check if it reverts back
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("프롬프트 복사")).toBeInTheDocument();
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
  });

  it("fails silently if clipboard API is unavailable or throws an error", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")),
      },
      writable: true,
      configurable: true,
    });

    render(<CopyPromptButton text="test prompt" />);
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test prompt");
    // Should not show "복사됨" if it fails
    expect(screen.getByText("프롬프트 복사")).toBeInTheDocument();
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
  });
});
