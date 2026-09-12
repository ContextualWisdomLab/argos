/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SessionFilesSummary, SessionFilesTab } from "./session-files";

describe("SessionFilesSummary", () => {
  it("renders with modified and read files", () => {
    const onOpenFilesTab = vi.fn();
    const files = {
      modified: [{ path: "test.js", count: 1, lastEventIdx: 0 }],
      read: [{ path: "test2.js", count: 2, lastEventIdx: 1 }],
    };
    render(
      <SessionFilesSummary files={files} onOpenFilesTab={onOpenFilesTab} />
    );

    const modifiedButton = screen.getByRole("button", { name: /1개 파일 수정됨/i });
    expect(modifiedButton).toBeDefined();

    const readButton = screen.getByRole("button", { name: /1개 파일 읽음/i });
    expect(readButton).toBeDefined();

    fireEvent.click(modifiedButton);
    expect(onOpenFilesTab).toHaveBeenCalledTimes(1);
  });
});

describe("SessionFilesTab", () => {
  it("renders with empty states", () => {
    const onJump = vi.fn();
    const files = { modified: [], read: [] };
    render(<SessionFilesTab files={files} onJump={onJump} />);

    expect(screen.getByText("No file reads or edits in this session.")).toBeDefined();
  });

  it("renders modified and read files and their aria-labels", () => {
    const onJump = vi.fn();
    const files = {
      modified: [{ path: "a/b/mod.js", count: 1, lastEventIdx: 5 }],
      read: [{ path: "x/y/read.js", count: 3, lastEventIdx: 10 }],
    };
    render(<SessionFilesTab files={files} onJump={onJump} />);

    const jumpModBtn = screen.getByRole("button", { name: "a/b/mod.js의 마지막 edit(으)로 이동" });
    expect(jumpModBtn).toBeDefined();

    const jumpReadBtn = screen.getByRole("button", { name: "x/y/read.js의 마지막 read(으)로 이동" });
    expect(jumpReadBtn).toBeDefined();

    fireEvent.click(jumpModBtn);
    expect(onJump).toHaveBeenCalledWith(5);
  });
});
