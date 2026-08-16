/** @vitest-environment jsdom */

import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDashboard } from './admin-dashboard'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

type MockResponseBody = Record<string, unknown>

function jsonResponse(body: MockResponseBody, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

function installAdminFetchMock() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/admin/users?')) {
        return jsonResponse({
          users: [
            {
              id: 'user_alice',
              email: 'alice@example.com',
              name: 'Alice',
              createdAt: '2026-08-01T00:00:00.000Z',
              memberships: [],
            },
            {
              id: 'user_bob',
              email: 'bob@example.com',
              name: 'Bob',
              createdAt: '2026-08-02T00:00:00.000Z',
              memberships: [],
            },
          ],
        })
      }
      if (url === '/api/admin/password-reset-links' && init?.method === 'POST') {
        return jsonResponse({
          url: 'https://argos.example/reset/token',
          path: '/reset/token',
          expiresAt: '2026-08-15T00:00:00.000Z',
        })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
  )
}

describe('AdminDashboard accessibility feedback', () => {
  let writeTextMock: ReturnType<typeof vi.fn>
  let originalClipboard: unknown

  beforeEach(() => {
    installAdminFetchMock()
    refresh.mockReset()

    writeTextMock = vi.fn().mockResolvedValue(undefined)

    originalClipboard = navigator.clipboard;
    const clipboard = { writeText: writeTextMock };
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboard,
      configurable: true,
      writable: true
    });
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true
    });
    cleanup()
  })

  it('announces the selected user and preserves a visible authored focus indicator', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Alice/ })).toBeInTheDocument()
    })

    const alice = screen.getByRole('button', { name: /Alice/ })
    const bob = screen.getByRole('button', { name: /Bob/ })

    expect(alice).toHaveAttribute('aria-pressed', 'true')
    expect(bob).toHaveAttribute('aria-pressed', 'false')
    expect(alice).toHaveClass('focus-visible:ring-2')

    await user.click(bob)

    expect(alice).toHaveAttribute('aria-pressed', 'false')
    expect(bob).toHaveAttribute('aria-pressed', 'true')
  })

  it('copy button name remains "Copy link" before, during, and after feedback, status container exists and resets', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    render(<AdminDashboard />)

    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Alice/ })).toBeInTheDocument()
    })

    const createBtn = screen.getByRole('button', { name: 'Create reset link' })
    fireEvent.click(createBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: 'Copy link' })

    // Status container should exist before activation
    const statusContainer = document.querySelector('[role="status"]')
    expect(statusContainer).toBeInTheDocument()
    expect(statusContainer).toHaveAttribute('aria-atomic', 'true')
    expect(statusContainer).toBeEmptyDOMElement()

    // No aria-live region inside button
    expect(copyButton.querySelector('[aria-live]')).not.toBeInTheDocument()

    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(statusContainer).toHaveTextContent('Link copied to clipboard.')
    })

    // Button name must still be "Copy link"
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    // It should not be renamed to "Copied"
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument()

    expect(writeTextMock).toHaveBeenCalledWith('https://argos.example/reset/token')

    // Repeated copy restarts timer
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(copyButton)
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    // Should still have text because we restarted timer 1500ms ago (timeout is 2000ms)
    expect(statusContainer).toHaveTextContent('Link copied to clipboard.')

    await act(async () => {
      vi.advanceTimersByTime(2100)
    })
    // Now it should be empty
    expect(statusContainer).toBeEmptyDOMElement()

    // Timer cleanup and user/link changes cannot emit stale success
    await act(async () => {
      fireEvent.click(copyButton)
    })
    await waitFor(() => {
      expect(statusContainer).toHaveTextContent('Link copied to clipboard.')
    })

    const bob = screen.getByRole('button', { name: /Bob/ })

    await act(async () => {
      fireEvent.click(bob)
    })

    await waitFor(() => {
      // Because resetLink is set to null, the container containing the status is removed entirely.
      // So instead of being empty, it might be gone.
      expect(document.querySelector('[role="status"]')).not.toBeInTheDocument()
    })
  })

  it('clipboard rejection produces only actionable error and leaves normal icon/action available', async () => {
    writeTextMock.mockRejectedValue(new Error('Clipboard denied'))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Alice/ })).toBeInTheDocument()
    })

    const createBtn = screen.getByRole('button', { name: 'Create reset link' })
    fireEvent.click(createBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: 'Copy link' })
    fireEvent.click(copyButton)

    // Expect error to be exposed
    await waitFor(() => {
      expect(screen.getByText(/Unable to copy link/i)).toBeInTheDocument()
      expect(screen.getByText(/select and copy the generated link manually/i)).toBeInTheDocument()
    })

    const statusContainer = document.querySelector('[role="status"]')
    expect(statusContainer).toBeEmptyDOMElement() // No success status

    // Normal icon/action remains
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })
})
