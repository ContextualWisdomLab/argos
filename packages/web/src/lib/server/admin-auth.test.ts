import { describe, it, expect, vi } from 'vitest'

// Mock server-only before importing the module that uses it
vi.mock('server-only', () => ({}))

import { verifyAdminCredentials, ADMIN_USERNAME, ADMIN_PASSWORD } from './admin-auth'

describe('verifyAdminCredentials', () => {
  it('returns true for correct username and password', () => {
    expect(
      verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      })
    ).toBe(true)
  })

  it('returns false for correct username but incorrect password', () => {
    expect(
      verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: 'wrongpassword',
      })
    ).toBe(false)
  })

  it('returns false for incorrect username but correct password', () => {
    expect(
      verifyAdminCredentials({
        username: 'wrongadmin',
        password: ADMIN_PASSWORD,
      })
    ).toBe(false)
  })

  it('returns false for incorrect username and incorrect password', () => {
    expect(
      verifyAdminCredentials({
        username: 'wrongadmin',
        password: 'wrongpassword',
      })
    ).toBe(false)
  })

  it('returns false for empty username and password', () => {
    expect(
      verifyAdminCredentials({
        username: '',
        password: '',
      })
    ).toBe(false)
  })
})
// Just to be sure we have more edge cases covered
describe('verifyAdminCredentials - Edge cases', () => {
  it('returns false when password is correct but username is empty', () => {
    expect(
      verifyAdminCredentials({
        username: '',
        password: ADMIN_PASSWORD,
      })
    ).toBe(false)
  })

  it('returns false when username is correct but password is empty', () => {
    expect(
      verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: '',
      })
    ).toBe(false)
  })
})
