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

const users = [
  {
    id: 'alice',
    email: 'alice@example.com',
    name: 'Alice Admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    memberships: [],
  },
  {
    id: 'bob',
    email: 'bob@example.com',
    name: 'Bob Buyer',
    createdAt: '2026-01-02T00:00:00.000Z',
    memberships: [],
  },
]

describe('AdminDashboard pending admin-action races', () => {
  beforeEach(() => {
    vi.stubGlobal('React', React)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('does not attach Alice reset link after the admin selects Bob', async () => {
    let resolveCreate!: (value: {
      ok: boolean
      json: () => Promise<{ url: string; path: string; expiresAt: string }>
    }) => void
    const createPending = new Promise<{
      ok: boolean
      json: () => Promise<{ url: string; path: string; expiresAt: string }>
    }>((resolve) => {
      resolveCreate = resolve
    })

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/admin/users?')) {
          return { ok: true, json: async () => ({ users }) }
        }
        if (url === '/api/admin/password-reset-links') {
          return createPending
        }
        throw new Error(`Unexpected request: ${url}`)
      })
    )

    render(<AdminDashboard />)
    await screen.findByRole('button', { name: /Alice Admin/ })

    fireEvent.click(screen.getByRole('button', { name: 'Create reset link' }))
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Bob Buyer/ }))
    expect(screen.getByRole('button', { name: /Bob Buyer/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Create reset link' })).toBeEnabled()
    expect(screen.queryByDisplayValue(/reset\/token/)).not.toBeInTheDocument()

    await act(async () => {
      resolveCreate({
        ok: true,
        json: async () => ({
          url: 'https://example.com/reset/token-alice',
          path: '/reset/token-alice',
          expiresAt: '2026-01-03T00:00:00.000Z',
        }),
      })
      await createPending
    })

    expect(screen.queryByDisplayValue('https://example.com/reset/token-alice')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bob Buyer/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not navigate with Alice impersonation URL after the admin selects Bob', async () => {
    let resolveImpersonation!: (value: {
      ok: boolean
      json: () => Promise<{ impersonationUrl: string }>
    }) => void
    const impersonationPending = new Promise<{
      ok: boolean
      json: () => Promise<{ impersonationUrl: string }>
    }>((resolve) => {
      resolveImpersonation = resolve
    })
    const assign = vi.fn()
    vi.stubGlobal('location', {
      origin: 'https://admin.example.com',
      href: 'https://admin.example.com/admin',
      assign,
    })

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/admin/users?')) {
          return { ok: true, json: async () => ({ users }) }
        }
        if (url === '/api/admin/impersonation') {
          return impersonationPending
        }
        throw new Error(`Unexpected request: ${url}`)
      })
    )

    render(<AdminDashboard />)
    await screen.findByRole('button', { name: /Alice Admin/ })

    fireEvent.click(screen.getByRole('button', { name: 'Open dashboard as user' }))
    expect(screen.getByRole('button', { name: 'Opening...' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Bob Buyer/ }))
    expect(screen.getByRole('button', { name: 'Open dashboard as user' })).toBeEnabled()

    await act(async () => {
      resolveImpersonation({
        ok: true,
        json: async () => ({
          impersonationUrl: '/admin/impersonate?token=alice-token',
        }),
      })
      await impersonationPending
    })

    expect(assign).not.toHaveBeenCalled()
    expect(
      screen.queryByText('Unable to open dashboard as selected user')
    ).not.toBeInTheDocument()
  })
})
