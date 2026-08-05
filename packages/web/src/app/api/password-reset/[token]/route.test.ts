import { BCRYPT_MAX_PASSWORD_BYTES } from '@argos/shared'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  resetPasswordWithToken: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/password-reset', () => ({
  getPasswordResetStatus: vi.fn(),
  resetPasswordWithToken: mocks.resetPasswordWithToken,
}))

import { POST } from './route.js'

function resetRequest(password: string): NextRequest {
  return new NextRequest('https://argos.example/api/password-reset/reset-token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password, passwordConfirmation: password }),
  })
}

const routeContext = { params: Promise.resolve({ token: 'reset-token' }) }

describe('POST /api/password-reset/[token] password boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.resetPasswordWithToken.mockResolvedValue('success')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts the exact bcrypt byte maximum into password reset processing', async () => {
    const password = 'x'.repeat(BCRYPT_MAX_PASSWORD_BYTES)
    const response = await POST(resetRequest(password), routeContext)

    expect(response.status).toBe(200)
    expect(mocks.resetPasswordWithToken).toHaveBeenCalledOnce()
    expect(mocks.resetPasswordWithToken).toHaveBeenCalledWith({
      token: 'reset-token',
      password,
    })
  })

  it('rejects a password bcrypt would truncate before hash processing', async () => {
    const response = await POST(
      resetRequest('x'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1)),
      routeContext,
    )

    expect(response.status).toBe(400)
    expect(mocks.resetPasswordWithToken).not.toHaveBeenCalled()
  })
})
