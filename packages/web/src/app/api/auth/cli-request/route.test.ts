import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/server/db', () => ({
  db: {
    cliAuthRequest: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/server/error-helper', () => ({
  handleRouteError: vi.fn((err: unknown) => {
    throw err
  }),
}))

import { db } from '@/lib/server/db'
import { POST } from './route'

describe('POST /api/auth/cli-request', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SITE_URL = 'https://trusted.example'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('builds the CLI auth URL from the trusted site URL, not a request host', async () => {
    vi.mocked(db.cliAuthRequest.create).mockResolvedValue({} as never)

    const response = await POST()
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.authUrl).toMatch(/^https:\/\/trusted\.example\/cli-auth\?state=/)
    expect(body.authUrl).not.toContain('evil.example')
    expect(db.cliAuthRequest.create).toHaveBeenCalledWith({
      data: {
        state: body.state,
        expiresAt: expect.any(Date),
      },
    })
  })
})
