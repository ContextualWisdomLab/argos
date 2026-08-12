import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./admin-dashboard";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

/** @vitest-environment jsdom */

// Mock UI components that need React to avoid "React is not defined" without modifying source
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  CardDescription: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className}>{children}</div>
  ),
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));
vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));
vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  AlertTitle: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
  AlertDescription: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div>{children}</div>
  ),
}));

// Mock lucide-react to avoid "React is not defined" error
vi.mock("lucide-react", () => ({
  Check: () => React.createElement("svg", { "data-testid": "check-icon" }),
  Copy: () => React.createElement("svg", { "data-testid": "copy-icon" }),
  Link2: () => React.createElement("svg"),
  LogIn: () => React.createElement("svg"),
  LogOut: () => React.createElement("svg"),
  Search: () => React.createElement("svg"),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // AdminDashboard uses AbortController and fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/admin/users")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              users: [
                {
                  id: "u1",
                  email: "admin@example.com",
                  name: "Admin User",
                  createdAt: new Date("2023-01-01").toISOString(),
                  memberships: [
                    {
                      role: "OWNER",
                      organization: { name: "Org", slug: "org" },
                    },
                  ],
                },
              ],
            }),
        });
      }
      if (url.includes("/api/admin/password-reset-links")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              url: "http://localhost/reset/fake",
              expiresAt: new Date("2024-01-01").toISOString(),
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
    vi.clearAllMocks();
  });

  it("renders correctly", async () => {
    render(<AdminDashboard />);
    expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument();
  });

  it("disables impersonation for ADMIN roles (OWNER or MANAGER)", async () => {
    render(<AdminDashboard />);

    // AdminDashboard has a 200ms debounce before fetching
    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    // Wait for the user to be loaded
    await waitFor(() => {
      expect(screen.getAllByText("Admin User").length).toBeGreaterThan(0);
    });

    // Click on the user to select them
    const userButton = screen.getAllByText("Admin User")[0].closest("button");
    expect(userButton).not.toBeNull();
    fireEvent.click(userButton!);

    // Check if the impersonation button is disabled and text is changed
    const impersonateBtn = await screen.findByRole("button", {
      name: /Cannot impersonate admins/i,
    });
    expect(impersonateBtn).toBeDisabled();
  });

  it("allows copying password reset link", async () => {
    render(<AdminDashboard />);

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getAllByText("Admin User").length).toBeGreaterThan(0);
    });

    const userButton = screen.getAllByText("Admin User")[0].closest("button");
    fireEvent.click(userButton!);

    const createLinkBtn = screen.getByRole("button", {
      name: /Create reset link/i,
    });
    fireEvent.click(createLinkBtn);

    // Advance timers so the mock fetch resolves
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("http://localhost/reset/fake"),
      ).toBeInTheDocument();
    });

    // The button might still say "Copy link" initially
    const copyBtn = screen.getByRole("button", { name: /Copy link/i });

    // wait for clipboard write to resolve since it's async
    await act(async () => {
      fireEvent.click(copyBtn);
      await Promise.resolve();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://localhost/reset/fake",
    );

    // Check that button text changed.
    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();

    // A second copy at 1.5s must replace the first timer rather than letting
    // the first timer clear the latest success state at 2.0s.
    await act(async () => {
      vi.advanceTimersByTime(1500);
      fireEvent.click(screen.getByRole("button", { name: /Copied/i }));
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(
      screen.getByRole("button", { name: /Copy link/i }),
    ).toBeInTheDocument();
  });
});
