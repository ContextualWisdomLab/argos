import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('./env', () => ({
  env: {
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'secure_password',
    ADMIN_COOKIE_SECRET: 'super_secret',
  },
}))

import { verifyAdminCredentials } from './admin-auth'

describe('verifyAdminCredentials', () => {
  it('returns true for correct credentials', () => {
    expect(verifyAdminCredentials({ username: 'admin', password: 'secure_password' })).toBe(true)
  })

  it('returns false for incorrect password', () => {
    expect(verifyAdminCredentials({ username: 'admin', password: 'wrong_password' })).toBe(false)
  })

  it('returns false for incorrect username', () => {
    expect(verifyAdminCredentials({ username: 'wrong_admin', password: 'secure_password' })).toBe(false)
  })

  it('handles extremely long inputs gracefully', () => {
    const longString = 'a'.repeat(600)
    expect(verifyAdminCredentials({ username: longString, password: longString })).toBe(false)
  })
})
