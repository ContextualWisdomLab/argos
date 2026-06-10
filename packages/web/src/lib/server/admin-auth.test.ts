import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'crypto'

vi.mock('server-only', () => ({}))

import {
  createAdminImpersonationToken,
  verifyAdminImpersonationToken,
} from './admin-auth'

vi.mock('./env', () => ({
  env: {
    JWT_SECRET: 'test-secret-123456789012345678901234',
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn(),
  },
}))

describe('admin impersonation token', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('verifies a valid token', () => {
    const userId = 'user-123'
    const token = createAdminImpersonationToken(userId)
    const result = verifyAdminImpersonationToken(token)
    expect(result).toBe(userId)
  })

  it('rejects tokens with incorrect number of parts', () => {
    expect(verifyAdminImpersonationToken('part1.part2')).toBeNull()
    expect(verifyAdminImpersonationToken('1.2.3.4.5.6')).toBeNull()
  })

  it('rejects tokens with wrong prefix', () => {
    const userId = 'user-123'
    const token = createAdminImpersonationToken(userId)
    const parts = token.split('.')
    const payload = `wrong_imp.${parts[1]}.${parts[2]}.${parts[3]}`
    const signature = createHmac('sha256', 'test-secret-123456789012345678901234').update(payload).digest('base64url')

    expect(verifyAdminImpersonationToken(`${payload}.${signature}`)).toBeNull()
  })

  it('rejects tokens with invalid signature', () => {
    const userId = 'user-123'
    const token = createAdminImpersonationToken(userId)
    const parts = token.split('.')
    parts[4] = 'invalid_signature'
    expect(verifyAdminImpersonationToken(parts.join('.'))).toBeNull()
  })

  it('rejects expired tokens', () => {
    const userId = 'user-123'
    const token = createAdminImpersonationToken(userId)

    // Advance time by 61 seconds (token TTL is 60s = 60000ms)
    vi.advanceTimersByTime(61000)

    expect(verifyAdminImpersonationToken(token)).toBeNull()
  })

  it('rejects tokens with invalid expiresAt', () => {
    const userId = 'user-123'
    const token = createAdminImpersonationToken(userId)
    const parts = token.split('.')
    parts[2] = 'not-a-number'

    const payload = `${parts[0]}.${parts[1]}.not-a-number.${parts[3]}`
    const signature = createHmac('sha256', 'test-secret-123456789012345678901234').update(payload).digest('base64url')

    expect(verifyAdminImpersonationToken(`${payload}.${signature}`)).toBeNull()
  })
})
