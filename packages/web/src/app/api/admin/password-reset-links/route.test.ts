import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/server/admin-auth', () => ({
  requireAdmin: vi.fn(() => null),
}))

vi.mock('@/lib/server/password-reset', () => ({
  createPasswordResetLink: vi.fn(),
}))

vi.mock('@/lib/server/error-helper', () => ({
  handleRouteError: vi.fn((err: unknown) => {
    throw err
  }),
}))

import { createPasswordResetLink } from '@/lib/server/password-reset'
import { POST } from './route'

function makeRequest() {
  return new NextRequest('https://evil.example/api/admin/password-reset-links', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'evil.example',
    },
    body: JSON.stringify({ userId: 'user-1' }),
  })
}

describe('POST /api/admin/password-reset-links', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.example'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('passes a trusted origin into password reset link generation', async () => {
    vi.mocked(createPasswordResetLink).mockResolvedValue({
      status: 'created',
      url: 'https://trusted.example/reset-password/token',
      path: '/reset-password/token',
      expiresAt: new Date('2026-01-01T00:00:00Z'),
    })

    const response = await POST(makeRequest())
    expect(response.status).toBe(201)
    expect(createPasswordResetLink).toHaveBeenCalledWith({
      userId: 'user-1',
      origin: 'https://trusted.example',
    })

    const body = await response.json()
    expect(body.url).not.toContain('evil.example')
  })
})
