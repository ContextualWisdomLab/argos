/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyPromptButton } from './copy-prompt-button';
import { cleanup } from '@testing-library/react';

// Setup React globally
global.React = React;

vi.mock('lucide-react', () => ({
  Copy: () => React.createElement('svg', { 'data-testid': 'copy-icon' }),
  Check: () => React.createElement('svg', { 'data-testid': 'check-icon' }),
}));

describe('CopyPromptButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly with default labels', () => {
    render(<CopyPromptButton text="test prompt" />);

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('프롬프트 복사');
    expect(screen.getAllByText('프롬프트 복사')[0]).toBeDefined();
    expect(screen.getByTestId('copy-icon')).toBeDefined();
  });

  it('renders correctly with custom labels', () => {
    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied" />);

    expect(screen.getAllByText('Copy')[0]).toBeDefined();
  });

  it('copies text and shows copied state temporarily', async () => {
    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied" />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test prompt');

    // Check copied state
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText('Copied')[0]).toBeDefined();
    expect(screen.getByTestId('check-icon')).toBeDefined();

    // Fast-forward timer
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Check reverted state
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getAllByText('Copy')[0]).toBeDefined();
    expect(screen.getByTestId('copy-icon')).toBeDefined();
  });

  it('fails silently if clipboard API is blocked or throws error', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Blocked')),
      },
      writable: true,
      configurable: true,
    });

    render(<CopyPromptButton text="test prompt" />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    // It shouldn't change state since it failed
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByTestId('copy-icon')).toBeDefined();
  });
});
