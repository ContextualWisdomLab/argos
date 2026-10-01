/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResetPasswordForm } from './reset-password-form';
import { cleanup } from '@testing-library/react';

// Setup React globally
global.React = React;

vi.mock('lucide-react', () => ({
  Loader2: () => React.createElement('svg', { 'data-testid': 'loader-icon', 'aria-hidden': 'true', className: 'mr-2 size-4 animate-spin' }),
}));

describe('ResetPasswordForm', () => {
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
    render(<ResetPasswordForm token="test-token" email="test@example.com" />);

    expect(screen.getByText('Reset password')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDefined();
    expect(screen.queryByTestId('loader-icon')).toBeNull();
  });

  it('shows loading state on submit', async () => {
    // Make fetch promise hanging so we can check loading state
    let resolveFetch: (value: any) => void;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => {
        resolveFetch = resolve;
    })));

    render(<ResetPasswordForm token="test-token" email="test@example.com" />);

    const passwordInput = screen.getByLabelText('New password');
    const passwordConfirmInput = screen.getByLabelText('Confirm new password');
    const submitButton = screen.getByRole('button', { name: 'Update password' });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(passwordConfirmInput, { target: { value: 'password123' } });
    });

    await act(async () => {
        fireEvent.submit(submitButton);
    });

    // Check loading state
    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDefined();
    expect(screen.getByTestId('loader-icon')).toBeDefined();

    // Resolve the hanging promise to finish the test cleanly
    await act(async () => {
        resolveFetch({ ok: true, json: () => Promise.resolve({}) });
    });
  });
});
