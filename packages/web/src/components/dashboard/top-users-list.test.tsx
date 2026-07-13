/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TopUsersList } from "./top-users-list";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TopUsersList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state when users array is empty", () => {
    render(<TopUsersList users={[]} />);
    expect(
      screen.getByText("최근 7일간 활동한 사용자가 없습니다"),
    ).toBeDefined();
  });

  it("renders top users list correctly", () => {
    const mockUsers = [
      {
        userId: "1",
        name: "Alice",
        inputTokens: 50,
        outputTokens: 50,
        sessionCount: 2,
        estimatedCostUsd: 0.1,
      },
      {
        userId: "2",
        name: "Bob",
        inputTokens: 10,
        outputTokens: 20,
        sessionCount: 1,
        estimatedCostUsd: 0.03,
      },
    ];
    render(<TopUsersList users={mockUsers} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("100")).toBeDefined(); // Alice tokens
    expect(screen.getByText("30")).toBeDefined(); // Bob tokens
  });

  it("renders correctly when maxTokens is 0 (all users have 0 tokens)", () => {
    const mockUsers = [
      {
        userId: "3",
        name: "Charlie",
        inputTokens: 0,
        outputTokens: 0,
        sessionCount: 2,
        estimatedCostUsd: 0.0,
      },
    ];
    render(<TopUsersList users={mockUsers} />);
    expect(screen.getByText("Charlie")).toBeDefined();
    expect(screen.getByText("0")).toBeDefined();
  });
});

// Mock formatTokens and formatCost to ensure we hit branches inside those modules or test specific formatting if needed (already handled by component test).
