/** @vitest-environment jsdom */
import React, { type SVGProps } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDashboard } from './admin-dashboard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('lucide-react', () => ({
  Copy: (props: SVGProps<SVGSVGElement>) => <svg data-testid="copy-icon" {...props} />,
  Check: (props: SVGProps<SVGSVGElement>) => <svg data-testid="check-icon" {...props} />,
  Link2: (props: SVGProps<SVGSVGElement>) => <svg {...props} />,
  LogIn: (props: SVGProps<SVGSVGElement>) => <svg {...props} />,
  LogOut: (props: SVGProps<SVGSVGElement>) => <svg {...props} />,
  Search: (props: SVGProps<SVGSVGElement>) => <svg {...props} />,
}))

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const writeText = vi.fn<() => Promise<void>>()
const users = [
  { id: 'alice', email: 'alice@example.com', name: 'Alice Admin', createdAt: '2026-01-01T00:00:00.000Z', memberships: [] },
  { id: 'bob', email: 'bob@example.com', name: 'Bob Buyer', createdAt: '2026-01-02T00:00:00.000Z', memberships: [] },
]

describe('AdminDashboard accessibility feedback', () => {
  beforeEach(() => {
    vi.stubGlobal('React', React)
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/admin/users?')) return { ok: true, json: async () => ({ users }) }
      if (url === '/api/admin/password-reset-links') {
        return {
          ok: true,
          json: async () => ({
            url: 'https://example.com/reset/token',
            path: '/reset/token',
            expiresAt: '2026-01-03T00:00:00.000Z',
          }),
        }
      }
      throw new Error(`Unexpected request: ${url}`)
    }))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('exposes selection and changes the copy icon while feedback is active', async () => {
    render(<AdminDashboard />)

    const alice = await screen.findByRole('button', { name: /Alice Admin/ })
    const bob = screen.getByRole('button', { name: /Bob Buyer/ })
    expect(alice).toHaveAttribute('aria-pressed', 'true')
    expect(bob).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(bob)
    expect(alice).toHaveAttribute('aria-pressed', 'false')
    expect(bob).toHaveAttribute('aria-pressed', 'true')
    expect(bob).toHaveClass('focus-visible:ring-2')

    fireEvent.click(screen.getByRole('button', { name: 'Create reset link' }))
    const copyButton = await screen.findByRole('button', { name: 'Copy link' })
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()

    vi.useFakeTimers()
    await act(async () => {
      fireEvent.click(copyButton)
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith('https://example.com/reset/token')
    const copiedButton = screen.getByRole('button', { name: 'Copied' })
    expect(copiedButton).toBeInTheDocument()
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('copy-icon')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    await act(async () => {
      fireEvent.click(copiedButton)
      await Promise.resolve()
    })
    expect(writeText).toHaveBeenCalledTimes(2)

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })
})
