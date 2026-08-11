// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminDashboard } from './admin-dashboard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('AdminDashboard copy feedback', () => {
  it('keeps the latest successful copy visible for two seconds', async () => {
    const resetUrl = 'https://example.test/reset/token'
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.startsWith('/api/admin/users?')) {
        return {
          ok: true,
          json: async () => ({
            users: [
              {
                id: 'user-1',
                email: 'user@example.test',
                name: 'Example User',
                createdAt: '2026-01-01T00:00:00.000Z',
                memberships: [],
              },
            ],
          }),
        }
      }

      if (url === '/api/admin/password-reset-links') {
        return {
          ok: true,
          json: async () => ({
            url: resetUrl,
            path: '/reset/token',
            expiresAt: '2026-01-02T00:00:00.000Z',
          }),
        }
      }

      throw new Error(`Unexpected fetch: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })

    render(<AdminDashboard />)

    fireEvent.click(await screen.findByRole('button', { name: 'Create reset link' }))
    const copyButton = await screen.findByRole('button', { name: 'Copy link' })

    vi.useFakeTimers()

    await act(async () => {
      fireEvent.click(copyButton)
      await Promise.resolve()
    })
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()

    act(() => vi.advanceTimersByTime(1000))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copied' }))
      await Promise.resolve()
    })

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy()
  })
})
