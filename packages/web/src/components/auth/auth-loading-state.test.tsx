/** @vitest-environment jsdom */
import React from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

import { AdminLoginForm } from '../admin/admin-login-form'
import { ResetPasswordForm } from './reset-password-form'

function deferredResponse() {
  let resolve!: (response: { ok: boolean; json: () => Promise<unknown> }) => void
  const promise = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((next) => {
    resolve = next
  })
  return { promise, resolve }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('auth submit loading states', () => {
  it('keeps the admin submit disabled and names the in-flight action once', async () => {
    const pending = deferredResponse()
    const fetchMock = vi.fn(() => pending.promise)
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<AdminLoginForm />)
    await user.type(screen.getByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const loadingButton = screen.getByRole('button', { name: 'Signing in...' })
    expect(loadingButton).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(loadingButton)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      pending.resolve({ ok: true, json: async () => ({}) })
      await pending.promise
    })
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
  })

  it('keeps password reset disabled with an unambiguous in-flight name', async () => {
    const pending = deferredResponse()
    const fetchMock = vi.fn(() => pending.promise)
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<ResetPasswordForm token="token" email="user@example.com" />)
    await user.type(screen.getByLabelText('New password'), 'password-1')
    await user.type(screen.getByLabelText('Confirm new password'), 'password-1')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    const loadingButton = screen.getByRole('button', { name: 'Updating...' })
    expect(loadingButton).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(loadingButton)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      pending.resolve({ ok: true, json: async () => ({}) })
      await pending.promise
    })
    await screen.findByText('Password changed')
  })
})
