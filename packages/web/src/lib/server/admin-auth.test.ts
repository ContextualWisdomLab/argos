import { describe, expect, it, vi } from 'vitest'
import { verifyAdminCredentials, ADMIN_USERNAME, ADMIN_PASSWORD } from './admin-auth'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('server-only', () => ({}))

describe('admin-auth', () => {
  describe('verifyAdminCredentials', () => {
    it('returns true for correct credentials', () => {
      expect(
        verifyAdminCredentials({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        })
      ).toBe(true)
    })

    it('returns false for incorrect username', () => {
      expect(
        verifyAdminCredentials({
          username: ADMIN_USERNAME + 'wrong',
          password: ADMIN_PASSWORD,
        })
      ).toBe(false)
    })

    it('returns false for incorrect password', () => {
      expect(
        verifyAdminCredentials({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD + 'wrong',
        })
      ).toBe(false)
    })

    it('returns false for inputs exceeding maximum length', () => {
      const longString = 'a'.repeat(513)
      expect(
        verifyAdminCredentials({
          username: longString,
          password: ADMIN_PASSWORD,
        })
      ).toBe(false)
    })
  })
})
