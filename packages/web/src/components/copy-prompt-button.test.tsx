/** @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import { CopyPromptButton } from './copy-prompt-button'
import '@testing-library/jest-dom/vitest'

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
  Copy: () => <svg data-testid="copy-icon" />,
}))

const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
})

describe('CopyPromptButton', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders button with label and copy icon, and handles copy interaction', async () => {
    render(<CopyPromptButton text="test-prompt" />)

    expect(screen.getByRole('button')).toHaveTextContent('프롬프트 복사')
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button'))
    expect(writeTextMock).toHaveBeenCalledWith('test-prompt')

    await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('복사됨')
    })

    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
