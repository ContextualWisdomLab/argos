import { describe, it, expect, vi } from 'vitest'

// Mock server-only before importing the module that uses it
vi.mock('server-only', () => ({}))

import { verifyAdminCredentials, ADMIN_USERNAME, ADMIN_PASSWORD } from './admin-auth'

describe('verifyAdminCredentials', async () => {
  it('returns true for correct username and password', async () => {
    expect(
      await verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      })
    ).toBe(true)
  })

  it('returns false for correct username but incorrect password', async () => {
    expect(
      await verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: 'wrongpassword',
      })
    ).toBe(false)
  })

  it('returns false for incorrect username but correct password', async () => {
    expect(
      await verifyAdminCredentials({
        username: 'wrongadmin',
        password: ADMIN_PASSWORD,
      })
    ).toBe(false)
  })

  it('returns false for incorrect username and incorrect password', async () => {
    expect(
      await verifyAdminCredentials({
        username: 'wrongadmin',
        password: 'wrongpassword',
      })
    ).toBe(false)
  })

  it('returns false for empty username and password', async () => {
    expect(
      await verifyAdminCredentials({
        username: '',
        password: '',
      })
    ).toBe(false)
  })
})
// Just to be sure we have more edge cases covered
describe('verifyAdminCredentials - Edge cases', async () => {
  it('returns false when password is correct but username is empty', async () => {
    expect(
      await verifyAdminCredentials({
        username: '',
        password: ADMIN_PASSWORD,
      })
    ).toBe(false)
  })

  it('returns false when username is correct but password is empty', async () => {
    expect(
      await verifyAdminCredentials({
        username: ADMIN_USERNAME,
        password: '',
      })
    ).toBe(false)
  })
})
