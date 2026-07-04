import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  verifyAdminCredentials,
  verifyAdminSessionCookie,
  createAdminSessionCookieValue,
  verifyAdminImpersonationToken,
  createAdminImpersonationToken,
  hasAdminSession,
  requireAdmin,
  adminCookieOptions,
  expiredAdminCookieOptions
} from './admin-auth'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn((name) => {
      if (name === 'argos_admin_session') return { value: 'test_value' }
      return undefined
    })
  }))
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn()
  }
}))

vi.mock('./env', () => ({
  env: {
    ADMIN_USERNAME: 'admin_test',
    ADMIN_PASSWORD: 'admin_test_password',
    ADMIN_COOKIE_SECRET: 'test_cookie_secret_min_32_chars_long'
  }
}))

describe('admin-auth', () => {
  it('verifies valid credentials', () => {
    expect(verifyAdminCredentials({ username: 'admin_test', password: 'admin_test_password' })).toBe(true)
  })

  it('rejects invalid credentials', () => {
    expect(verifyAdminCredentials({ username: 'admin_test', password: 'wrong' })).toBe(false)
    expect(verifyAdminCredentials({ username: 'wrong', password: 'admin_test_password' })).toBe(false)
  })

  it('rejects long credentials', () => {
    expect(verifyAdminCredentials({ username: 'a'.repeat(600), password: 'admin_test_password' })).toBe(false)
    expect(verifyAdminCredentials({ username: 'admin_test', password: 'a'.repeat(600) })).toBe(false)
  })

  it('handles cookies properly', () => {
    const cookie = createAdminSessionCookieValue()
    expect(verifyAdminSessionCookie(cookie)).toBe(true)
    expect(verifyAdminSessionCookie('invalid.cookie')).toBe(false)
    expect(verifyAdminSessionCookie(undefined)).toBe(false)
  })

  it('invalidates malformed cookie payload', () => {
    const cookie = createAdminSessionCookieValue()
    const parts = cookie.split('.')
    parts[0] = 'wrong_admin'
    expect(verifyAdminSessionCookie(parts.join('.'))).toBe(false)

    const parts2 = cookie.split('.')
    parts2[3] = 'wrong_signature'
    expect(verifyAdminSessionCookie(parts2.join('.'))).toBe(false)

    const parts3 = cookie.split('.')
    parts3[1] = 'not_a_number'
    expect(verifyAdminSessionCookie(parts3.join('.'))).toBe(false)

    const parts4 = cookie.split('.')
    parts4[1] = '0' // expired
    expect(verifyAdminSessionCookie(parts4.join('.'))).toBe(false)
  })

  it('handles impersonation tokens properly', () => {
    const token = createAdminImpersonationToken('user_123')
    expect(verifyAdminImpersonationToken(token)).toBe('user_123')
    expect(verifyAdminImpersonationToken('invalid.token')).toBeNull()
  })

  it('invalidates malformed impersonation tokens', () => {
    const token = createAdminImpersonationToken('user_123')
    const parts = token.split('.')
    parts[0] = 'wrong_prefix'
    expect(verifyAdminImpersonationToken(parts.join('.'))).toBeNull()

    const parts2 = token.split('.')
    parts2[4] = 'wrong_signature'
    expect(verifyAdminImpersonationToken(parts2.join('.'))).toBeNull()

    const parts3 = token.split('.')
    parts3[2] = 'not_a_number'
    expect(verifyAdminImpersonationToken(parts3.join('.'))).toBeNull()

    const parts4 = token.split('.')
    parts4[2] = '0' // expired
    expect(verifyAdminImpersonationToken(parts4.join('.'))).toBeNull()
  })

  it('checks hasAdminSession', async () => {
    // We mocked cookies to return test_value, which is invalid
    expect(await hasAdminSession()).toBe(false)
  })

  it('checks requireAdmin', () => {
    const req = { cookies: { get: vi.fn(() => undefined) } } as unknown as NextRequest
    requireAdmin(req)

    const req2 = { cookies: { get: vi.fn(() => ({ value: createAdminSessionCookieValue() })) } } as unknown as NextRequest
    expect(requireAdmin(req2)).toBeNull()
  })

  it('generates cookie options', () => {
    expect(adminCookieOptions()).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
    expect(expiredAdminCookieOptions()).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  })
})
