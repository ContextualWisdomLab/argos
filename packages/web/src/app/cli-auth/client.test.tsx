/* eslint-disable @typescript-eslint/no-explicit-any */
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CliAuthClient } from './client';
import { cleanup } from '@testing-library/react';

global.React = React;

describe('CliAuthClient', () => {
  const defaultProps = {
    state: 'mock-state',
    userName: 'Test User',
    userEmail: 'test@example.com',
    argosToken: 'mock-token',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly in pending state', () => {
    render(<CliAuthClient {...defaultProps} />);

    expect(screen.getByText('CLI 로그인 요청')).toBeDefined();
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('test@example.com', { exact: false })).toBeDefined();
    expect(screen.getByRole('button', { name: '허용' })).toBeDefined();
    expect(screen.getByRole('button', { name: '거부' })).toBeDefined();
  });

  it('handles allow action successfully', async () => {
    // Create a promise we can control to test loading state
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (global.fetch as any).mockReturnValueOnce(fetchPromise);

    render(<CliAuthClient {...defaultProps} />);

    const allowBtn = screen.getByRole('button', { name: '허용' });
    const denyBtn = screen.getByRole('button', { name: '거부' });

    // Initiate click (which sets loading state)
    fireEvent.click(allowBtn);

    // Check loading state while promise is pending
    expect(allowBtn.textContent).toBe('처리 중...');
    expect(allowBtn.hasAttribute('disabled')).toBe(true);
    expect(denyBtn.hasAttribute('disabled')).toBe(true);

    // Resolve promise
    await act(async () => {
      resolveFetch!({ ok: true });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/cli-callback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer mock-token`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'mock-state' }),
    });

    expect(screen.getByText('로그인 완료')).toBeDefined();
  });

  it('handles allow action failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CliAuthClient {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '허용' }));
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });

  it('handles allow action non-ok response', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    render(<CliAuthClient {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '허용' }));
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });

  it('handles deny action successfully', async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (global.fetch as any).mockReturnValueOnce(fetchPromise);

    render(<CliAuthClient {...defaultProps} />);

    const allowBtn = screen.getByRole('button', { name: '허용' });
    const denyBtn = screen.getByRole('button', { name: '거부' });

    fireEvent.click(denyBtn);

    // Check loading state while promise is pending
    expect(denyBtn.textContent).toBe('처리 중...');
    expect(allowBtn.hasAttribute('disabled')).toBe(true);
    expect(denyBtn.hasAttribute('disabled')).toBe(true);

    await act(async () => {
      resolveFetch!({ ok: true });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/cli-callback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer mock-token`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'mock-state', denied: true }),
    });

    expect(screen.getByText('로그인 거부됨')).toBeDefined();
  });

  it('handles deny action failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<CliAuthClient {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '거부' }));
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });
});
