/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { ContextSection } from "./context-section";

describe("ContextSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title and toggles content", async () => {
    const user = userEvent.setup();
    render(
      <ContextSection title="Test Title">
        <div data-testid="test-content">Content</div>
      </ContextSection>,
    );

    // Initially closed
    expect(screen.getByRole("button", { name: "Test Title" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();

    // Click to open
    await user.click(screen.getByRole("button", { name: "Test Title" }));
    expect(screen.getByRole("button", { name: "Test Title" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const region = screen.getByRole("region", { name: "Test Title" });
    expect(region).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    // Click to close
    await user.click(screen.getByRole("button", { name: "Test Title" }));
    expect(screen.getByRole("button", { name: "Test Title" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("renders open by default if defaultOpen is true", () => {
    render(
      <ContextSection title="Test Title" defaultOpen>
        <div data-testid="test-content">Content</div>
      </ContextSection>,
    );

    expect(screen.getByRole("button", { name: "Test Title" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Test Title" }),
    ).toBeInTheDocument();
  });
});
