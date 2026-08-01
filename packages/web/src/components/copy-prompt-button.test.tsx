/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, beforeAll } from 'vitest'
import '@testing-library/jest-dom/vitest'

import { CopyPromptButton } from './copy-prompt-button'

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" aria-hidden="true" />,
  Copy: () => <svg data-testid="copy-icon" aria-hidden="true" />,
}))

describe('CopyPromptButton', () => {
  const writeTextMock = vi.fn()

  beforeAll(() => {
    const originalNavigator = global.navigator;
    global.navigator = {
      ...originalNavigator,
      clipboard: {
        writeText: writeTextMock,
      },
    } as unknown as Navigator;
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    writeTextMock.mockReset()
  })

  it('renders correctly with default labels', () => {
    render(<CopyPromptButton text="test text" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    const liveRegion = screen.getByText('프롬프트 복사')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
  })

  it('copies text and shows copied state', async () => {
    writeTextMock.mockResolvedValue(undefined)
    vi.useFakeTimers()

    render(<CopyPromptButton text="test text" />)

    const button = screen.getByRole('button')

    await act(async () => {
      button.click()
    })

    expect(writeTextMock).toHaveBeenCalledWith('test text')

    expect(screen.getByText('복사됨')).toBeInTheDocument()
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('프롬프트 복사')).toBeInTheDocument()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('handles clipboard API failure gracefully', async () => {
    writeTextMock.mockRejectedValue(new Error('clipboard error'))

    render(<CopyPromptButton text="test text" />)

    const button = screen.getByRole('button')

    await act(async () => {
      button.click()
    })

    expect(screen.getByText('프롬프트 복사')).toBeInTheDocument()
  })
})
