import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/db', () => ({
  db: {
    cliToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('./jwt', () => ({
  verifyJwt: vi.fn(),
}))

import { requireAuth } from './auth-helper'
import { verifyJwt } from './jwt'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAuth', () => {
  it('returns the standard unauthorized error when the bearer header is missing', async () => {
    const result = await requireAuth(new Request('https://argos.example/api/events'))

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    await expect((result as NextResponse).json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    })
  })

  it('returns the standard unauthorized error when the token is invalid', async () => {
    vi.mocked(verifyJwt).mockResolvedValue(null)

    const result = await requireAuth(
      new Request('https://argos.example/api/events', {
        headers: { Authorization: 'Bearer invalid-token' },
      }),
    )

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    await expect((result as NextResponse).json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    })
  })
})
