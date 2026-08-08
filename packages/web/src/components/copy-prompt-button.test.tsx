/** @vitest-environment jsdom */
import React from 'react'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { CopyPromptButton } from './copy-prompt-button'

vi.mock('lucide-react', () => ({
  Copy: () => <svg data-testid="copy-icon" />,
  Check: () => <svg data-testid="check-icon" />,
}))

// Make React globally available for the component being tested
global.React = React;

describe('CopyPromptButton', () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    writeTextMock.mockReset()
    cleanup()
  })

  it('renders default state correctly', () => {
    render(<CopyPromptButton text="test prompt" />)
    expect(screen.getByText('프롬프트 복사')).toBeInTheDocument()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
    const liveSpan = screen.getByText('프롬프트 복사').closest('span')
    expect(liveSpan).toHaveAttribute('aria-live', 'polite')
  })

  it('handles copy action and resets state after timeout', async () => {
    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied!" />)

    const button = screen.getByRole('button')

    await React.act(async () => {
      fireEvent.click(button)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test prompt')

    expect(screen.getByText('Copied!')).toBeInTheDocument()
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()

    await React.act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
  })

  it('fails silently if clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('not allowed')),
      },
      writable: true,
      configurable: true,
    })

    render(<CopyPromptButton text="test prompt" label="Copy" copiedLabel="Copied!" />)

    const button = screen.getByRole('button')

    await React.act(async () => {
      fireEvent.click(button)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test prompt')

    expect(screen.getByText('Copy')).toBeInTheDocument()
  })
})
