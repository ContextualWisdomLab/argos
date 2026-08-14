import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/password-reset', () => ({
  getPasswordResetStatus: vi.fn(),
  resetPasswordWithToken: vi.fn(),
}))

vi.mock('@/lib/server/error-helper', () => ({
  handleRouteError: vi.fn((error: unknown) =>
    NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: String(error) } }, { status: 500 }),
  ),
  jsonError: vi.fn((code: string, message: string, status: number) =>
    NextResponse.json({ error: { code, message } }, { status }),
  ),
}))

import { getPasswordResetStatus } from '@/lib/server/password-reset'
import { GET } from './route'

const params = Promise.resolve({ token: 'argos_pwd_test' })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/password-reset/[token]', () => {
  it.each([
    ['not_found', 404, 'RESET_LINK_NOT_FOUND'],
    ['expired', 410, 'RESET_LINK_EXPIRED'],
    ['used', 410, 'RESET_LINK_ALREADY_USED'],
  ] as const)('maps %s status to the standard error contract', async (status, code, expectedCode) => {
    vi.mocked(getPasswordResetStatus).mockResolvedValue({ status })

    const response = await GET(
      new NextRequest('https://argos.example/api/password-reset/argos_pwd_test'),
      { params },
    )

    expect(response.status).toBe(code)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: expectedCode,
        message: expect.any(String),
      },
    })
  })
})
