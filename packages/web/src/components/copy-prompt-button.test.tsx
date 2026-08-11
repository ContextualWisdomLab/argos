/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyPromptButton } from './copy-prompt-button';
import { cleanup } from '@testing-library/react';

// Setup React globally
global.React = React;

vi.mock('lucide-react', () => ({
  Copy: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { ...props, 'data-testid': 'copy-icon' }),
  Check: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { ...props, 'data-testid': 'check-icon' }),
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
    expect(button.getAttribute('aria-pressed')).toBeNull();
    expect(screen.getByText('프롬프트 복사').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('copy-icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('renders correctly with custom labels', () => {
    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied" />);

    expect(screen.getByText('Copy').getAttribute('aria-live')).toBe('polite');
  });

  it('copies text and shows copied state temporarily', async () => {
    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied" />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test prompt');

    // A copy action reports its result without masquerading as a toggle.
    expect(button.getAttribute('aria-pressed')).toBeNull();
    expect(screen.getByText('Copied').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('check-icon').getAttribute('aria-hidden')).toBe('true');

    // Fast-forward timer
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Check reverted state
    expect(button.getAttribute('aria-pressed')).toBeNull();
    expect(screen.getByText('Copy').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('copy-icon').getAttribute('aria-hidden')).toBe('true');
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
    expect(button.getAttribute('aria-pressed')).toBeNull();
    expect(screen.getByText('프롬프트 복사').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('copy-icon').getAttribute('aria-hidden')).toBe('true');
  });
});
