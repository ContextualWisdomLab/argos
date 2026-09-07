/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { CliAuthClient } from './client';
import { cleanup } from '@testing-library/react';

global.React = React;

describe('CliAuthClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    state: 'mock-state',
    userName: 'Test User',
    userEmail: 'test@example.com',
    argosToken: 'mock-token'
  };

  it('renders correctly in pending state', () => {
    render(<CliAuthClient {...defaultProps} />);
    expect(screen.getByText('CLI 로그인 요청')).toBeDefined();
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByRole('button', { name: '허용' })).toBeDefined();
    expect(screen.getByRole('button', { name: '거부' })).toBeDefined();
  });

  it('handles allow click successfully', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: true });

    render(<CliAuthClient {...defaultProps} />);

    const allowBtn = screen.getByRole('button', { name: '허용' });

    await act(async () => {
      fireEvent.click(allowBtn);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/cli-callback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ state: 'mock-state' })
    }));

    expect(screen.getByText('로그인 완료')).toBeDefined();
  });

  it('handles allow click failure', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: false });

    render(<CliAuthClient {...defaultProps} />);

    const allowBtn = screen.getByRole('button', { name: '허용' });

    await act(async () => {
      fireEvent.click(allowBtn);
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });

  it('handles deny click successfully', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: true });

    render(<CliAuthClient {...defaultProps} />);

    const denyBtn = screen.getByRole('button', { name: '거부' });

    await act(async () => {
      fireEvent.click(denyBtn);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/cli-callback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ state: 'mock-state', denied: true })
    }));

    expect(screen.getByText('로그인 거부됨')).toBeDefined();
  });

  it('does not report denial when the callback rejects it', async () => {
    (global.fetch as Mock).mockResolvedValue({ ok: false });

    render(<CliAuthClient {...defaultProps} />);

    const denyBtn = screen.getByRole('button', { name: '거부' });

    await act(async () => {
      fireEvent.click(denyBtn);
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
    expect(screen.queryByText('로그인 거부됨')).toBeNull();
  });

  it('handles network error', async () => {
    (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

    render(<CliAuthClient {...defaultProps} />);

    const allowBtn = screen.getByRole('button', { name: '허용' });

    await act(async () => {
      fireEvent.click(allowBtn);
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });

  it('handles deny click with network error', async () => {
    (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

    render(<CliAuthClient {...defaultProps} />);

    const denyBtn = screen.getByRole('button', { name: '거부' });

    await act(async () => {
      fireEvent.click(denyBtn);
    });

    expect(screen.getByText('오류 발생')).toBeDefined();
  });
});
