import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('./env', () => ({
  env: {
    JWT_SECRET: '01234567890123456789012345678901', // 32 chars
    DATABASE_URL: 'dummy',
    DIRECT_URL: 'dummy',
  }
}))

// Need to mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn()
  }
}))

import { verifyAdminSessionCookie, createAdminSessionCookieValue } from './admin-auth'
import { createHmac } from 'crypto'

describe('verifyAdminSessionCookie', () => {
  it('returns true for a valid cookie', () => {
    const cookie = createAdminSessionCookieValue()
    expect(verifyAdminSessionCookie(cookie)).toBe(true)
  })

  it('returns false for undefined', () => {
    expect(verifyAdminSessionCookie(undefined)).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(verifyAdminSessionCookie('')).toBe(false)
  })

  it('returns false if parts are not 4', () => {
    expect(verifyAdminSessionCookie('part1.part2.part3')).toBe(false)
    expect(verifyAdminSessionCookie('part1.part2.part3.part4.part5')).toBe(false)
  })

  it('returns false if signature is invalid', () => {
    const validCookie = createAdminSessionCookieValue()
    const parts = validCookie.split('.')
    parts[3] = 'invalid-signature'
    expect(verifyAdminSessionCookie(parts.join('.'))).toBe(false)
  })

  it('returns false if username is tampered', () => {
    const validCookie = createAdminSessionCookieValue()
    const parts = validCookie.split('.')
    parts[0] = 'not-admin'

    // Create valid signature for tampered payload
    const payload = `${parts[0]}.${parts[1]}.${parts[2]}`
    const tamperedSignature = createHmac('sha256', '01234567890123456789012345678901').update(payload).digest('base64url')

    expect(verifyAdminSessionCookie(`${payload}.${tamperedSignature}`)).toBe(false)
  })

  it('returns false if expired', () => {
    const validCookie = createAdminSessionCookieValue()
    const parts = validCookie.split('.')

    // Set expiry to past
    parts[1] = (Date.now() - 1000).toString()

    const payload = `${parts[0]}.${parts[1]}.${parts[2]}`
    const signature = createHmac('sha256', '01234567890123456789012345678901').update(payload).digest('base64url')

    expect(verifyAdminSessionCookie(`${payload}.${signature}`)).toBe(false)
  })
})
