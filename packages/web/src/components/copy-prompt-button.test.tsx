/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen, cleanup, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { CopyPromptButton } from './copy-prompt-button'

vi.mock('lucide-react', () => ({
  Check: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean | "true" | "false" }) => {
    const isHidden = ariaHidden === true || ariaHidden === "true" ? "true" : undefined;
    return <svg data-testid="check-icon" aria-hidden={isHidden} />
  },
  Copy: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean | "true" | "false" }) => {
    const isHidden = ariaHidden === true || ariaHidden === "true" ? "true" : undefined;
    return <svg data-testid="copy-icon" aria-hidden={isHidden} />
  },
}))

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}))

describe('CopyPromptButton', () => {
  let writeTextMock: any;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: {
        writeText: writeTextMock
      }
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  it('renders default label and icon, and handles copy click', async () => {
    render(<CopyPromptButton text="test prompt" />)

    const button = screen.getByRole('button')
    const liveRegion = button.querySelector('span[aria-live="polite"]')

    expect(liveRegion).toHaveTextContent('프롬프트 복사')
    const copyIcon = screen.getByTestId('copy-icon')
    expect(copyIcon).toHaveAttribute('aria-hidden', 'true')

    await act(async () => {
        button.click()
    })

    expect(writeTextMock).toHaveBeenCalledWith('test prompt')
    expect(liveRegion).toHaveTextContent('복사됨')

    const checkIcon = screen.getByTestId('check-icon')
    expect(checkIcon).toHaveAttribute('aria-hidden', 'true')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(liveRegion).toHaveTextContent('프롬프트 복사')
  })

  it('fails silently if clipboard is unavailable', async () => {
    writeTextMock.mockRejectedValue(new Error('not allowed'))

    render(<CopyPromptButton text="test prompt" />)

    const button = screen.getByRole('button')
    await act(async () => {
        button.click()
    })

    const liveRegion = button.querySelector('span[aria-live="polite"]')
    expect(liveRegion).toHaveTextContent('프롬프트 복사')
  })
})
