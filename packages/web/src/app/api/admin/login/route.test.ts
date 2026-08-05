import { MAX_PASSWORD_LENGTH } from '@argos/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  verifyAdminCredentials: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/admin-auth', () => ({
  ADMIN_SESSION_COOKIE: 'argos_admin_session',
  adminCookieOptions: vi.fn(() => ({})),
  createAdminSessionCookieValue: vi.fn(() => 'session-value'),
  verifyAdminCredentials: mocks.verifyAdminCredentials,
}))

import { POST } from './route.js'

function loginRequest(password: string): Request {
  return new Request('https://argos.example/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  })
}

describe('POST /api/admin/login password boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.verifyAdminCredentials.mockResolvedValue(false)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts the exact maximum into credential verification', async () => {
    const password = 'x'.repeat(MAX_PASSWORD_LENGTH)
    const response = await POST(loginRequest(password))

    expect(response.status).toBe(401)
    expect(mocks.verifyAdminCredentials).toHaveBeenCalledOnce()
    expect(mocks.verifyAdminCredentials).toHaveBeenCalledWith({ username: 'admin', password })
  })

  it('rejects a password above the maximum before credential verification', async () => {
    const response = await POST(loginRequest('x'.repeat(MAX_PASSWORD_LENGTH + 1)))

    expect(response.status).toBe(400)
    expect(mocks.verifyAdminCredentials).not.toHaveBeenCalled()
  })
})
