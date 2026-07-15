import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminDashboard } from './admin-dashboard';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom/vitest';

/** @vitest-environment jsdom */

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="icon-check" />,
  Copy: () => <svg data-testid="icon-copy" />,
  Link2: () => <svg data-testid="icon-link2" />,
  LogIn: () => <svg data-testid="icon-login" />,
  LogOut: () => <svg data-testid="icon-logout" />,
  Search: () => <svg data-testid="icon-search" />,
}));

describe('AdminDashboard UX/A11y', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Setup fetch mock
    global.fetch = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders and allows user selection with aria-pressed', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        memberships: [],
      },
      {
        id: 'user-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date().toISOString(),
        memberships: [],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(<AdminDashboard />);

    // Wait for initial fetch and debounced update
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    // Check user 1 (selected by default as first in list)
    const user1Button = await screen.findByRole('button', { name: /John Doe/ });
    expect(user1Button).toHaveAttribute('aria-pressed', 'true');
    expect(user1Button).toHaveClass('focus-visible:ring-2');

    // Check user 2 (not selected)
    const user2Button = screen.getByRole('button', { name: /Jane Doe/ });
    expect(user2Button).toHaveAttribute('aria-pressed', 'false');

    // Click user 2
    fireEvent.click(user2Button);
    expect(user2Button).toHaveAttribute('aria-pressed', 'true');
    expect(user1Button).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows check icon and reverts back to copy icon when creating link', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        memberships: [],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(<AdminDashboard />);

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    // Create link mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: 'http://example.com/reset',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    });

    const createLinkButton = await screen.findByRole('button', { name: /Create reset link/i });

    await act(async () => {
      fireEvent.click(createLinkButton);
      // Let the promise resolve for the fetch call
      await Promise.resolve();
    });

    // Find copy button
    const copyButton = await screen.findByRole('button', { name: /Copy link/i });
    expect(screen.getByTestId('icon-copy')).toBeInTheDocument();

    // Click copy
    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve(); // for clipboard write
    });

    // Should say Copied and have Check icon
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/reset');
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copied/i })).toBeInTheDocument();

    // Advance time to trigger setTimeout
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should revert back
    expect(screen.getByTestId('icon-copy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy link/i })).toBeInTheDocument();
  });
});
