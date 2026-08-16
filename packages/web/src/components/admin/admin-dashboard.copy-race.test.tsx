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
const users = [
  {
    id: 'alice',
    email: 'alice@example.com',
    name: 'Alice Admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    memberships: [],
  },
]

describe('AdminDashboard clipboard race handling', () => {
  beforeEach(() => {
    vi.stubGlobal('React', React)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('does not apply an old clipboard success to a newly generated reset link', async () => {
    let resolveClipboard!: () => void
    const clipboardPending = new Promise<void>((resolve) => {
      resolveClipboard = resolve
    })
    const writeText = vi.fn(() => clipboardPending)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    let generatedLinkCount = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/admin/users?')) {
          return { ok: true, json: async () => ({ users }) }
        }
        if (url === '/api/admin/password-reset-links') {
          generatedLinkCount += 1
          return {
            ok: true,
            json: async () => ({
              url: `https://example.com/reset/token-${generatedLinkCount}`,
              path: `/reset/token-${generatedLinkCount}`,
              expiresAt: '2026-01-03T00:00:00.000Z',
            }),
          }
        }
        throw new Error(`Unexpected request: ${url}`)
      })
    )

    render(<AdminDashboard />)
    await screen.findByRole('button', { name: /Alice Admin/ })

    fireEvent.click(screen.getByRole('button', { name: 'Create reset link' }))
    const copyButton = await screen.findByRole('button', { name: 'Copy reset link' })
    expect(screen.getByDisplayValue('https://example.com/reset/token-1')).toBeInTheDocument()

    fireEvent.click(copyButton)
    expect(writeText).toHaveBeenCalledWith('https://example.com/reset/token-1')

    fireEvent.click(screen.getByRole('button', { name: 'Create reset link' }))
    expect(await screen.findByDisplayValue('https://example.com/reset/token-2')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    await act(async () => {
      resolveClipboard()
      await clipboardPending
    })

    expect(screen.getByDisplayValue('https://example.com/reset/token-2')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })
})
