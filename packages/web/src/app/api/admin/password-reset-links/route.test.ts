import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/admin-auth', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/server/password-reset', () => ({
  createPasswordResetLink: vi.fn(),
}))

vi.mock('@/lib/server/error-helper', () => ({
  handleRouteError: vi.fn((err: unknown) =>
    NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  ),
}))

import { requireAdmin } from '@/lib/server/admin-auth'
import { createPasswordResetLink } from '@/lib/server/password-reset'
import { POST } from './route'

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

function makeRequest() {
  return new NextRequest('https://attacker.example/api/admin/password-reset-links', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'attacker.example',
    },
    body: JSON.stringify({ userId: 'user-1' }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.argos.example/admin'
  vi.mocked(requireAdmin).mockReturnValue(null)
  vi.mocked(createPasswordResetLink).mockResolvedValue({
    status: 'created',
    url: 'https://trusted.argos.example/reset-password/token',
    path: '/reset-password/token',
    expiresAt: new Date('2026-01-01T00:00:00.000Z'),
  })
})

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
  }
})

describe('POST /api/admin/password-reset-links', () => {
  it('passes the configured origin to reset-link generation despite a hostile Host header', async () => {
    const res = await POST(makeRequest())

    expect(res.status).toBe(201)
    expect(createPasswordResetLink).toHaveBeenCalledWith({
      userId: 'user-1',
      origin: 'https://trusted.argos.example',
    })
  })
})
