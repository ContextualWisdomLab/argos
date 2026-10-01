/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminLoginForm } from './admin-login-form';
import { cleanup } from '@testing-library/react';

// Setup React globally
global.React = React;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('lucide-react', () => ({
  Lock: () => React.createElement('svg', { 'data-testid': 'lock-icon' }),
  Loader2: () => React.createElement('svg', { 'data-testid': 'loader-icon', 'aria-hidden': 'true', className: 'mr-2 size-4 animate-spin' }),
}));

describe('AdminLoginForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly', () => {
    render(<AdminLoginForm />);

    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDefined();
    expect(screen.queryByTestId('loader-icon')).toBeNull();
  });

  it('shows loading state on submit', async () => {
    // Make fetch promise hanging so we can check loading state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveFetch: (value: any) => void;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => {
        resolveFetch = resolve;
    })));

    render(<AdminLoginForm />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    });

    await act(async () => {
        fireEvent.submit(submitButton);
    });

    // Check loading state
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDefined();
    expect(screen.getByTestId('loader-icon')).toBeDefined();

    // Resolve the hanging promise to finish the test cleanly
    await act(async () => {
        resolveFetch({ ok: true });
    });
  });
});
