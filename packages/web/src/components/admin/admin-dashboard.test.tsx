/** @vitest-environment jsdom */

import React from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
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

async function renderLoadedDashboard() {
  render(<AdminDashboard />)
  await screen.findByText('Alice')
  return userEvent.setup()
}

describe('AdminDashboard accessibility feedback', () => {
  beforeEach(() => {
    vi.stubGlobal('React', React)
    installAdminFetchMock()
    refresh.mockReset()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    cleanup()
  })

  it('announces the selected user and preserves a visible authored focus indicator', async () => {
    const user = await renderLoadedDashboard()
    const alice = screen.getByRole('button', { name: /Alice/ })
    const bob = screen.getByRole('button', { name: /Bob/ })

    expect(alice).toHaveAttribute('aria-pressed', 'true')
    expect(bob).toHaveAttribute('aria-pressed', 'false')
    expect(alice).toHaveClass('focus-visible:ring-2')

    await user.click(bob)

    expect(alice).toHaveAttribute('aria-pressed', 'false')
    expect(bob).toHaveAttribute('aria-pressed', 'true')
  })

  it('returns copy-success feedback to the ready state after two seconds', async () => {
    const user = await renderLoadedDashboard()

    await user.click(screen.getByRole('button', { name: 'Create reset link' }))
    const copyButton = await screen.findByRole('button', { name: 'Copy link' })

    vi.useFakeTimers()
    fireCopy(copyButton)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument())
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://argos.example/reset/token')

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })
})

function fireCopy(button: HTMLElement) {
  button.click()
}
