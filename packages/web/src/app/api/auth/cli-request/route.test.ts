import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/db', () => {
  const db = {
    cliAuthRequest: {
      create: vi.fn(),
    },
  }
  return { db }
})

import { db } from '@/lib/server/db'
import { POST } from './route'

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.argos.example/app'
})

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
  }
})

describe('POST /api/auth/cli-request', () => {
  it('builds the CLI auth URL from configured origin, not an incoming Host header', async () => {
    const res = await POST()

    expect(res.status).toBe(200)
    const body = (await res.json()) as { state: string; authUrl: string }
    expect(body.authUrl).toBe(`https://trusted.argos.example/cli-auth?state=${body.state}`)
    expect(db.cliAuthRequest.create).toHaveBeenCalledWith({
      data: {
        state: body.state,
        expiresAt: expect.any(Date),
      },
    })
  })
})
