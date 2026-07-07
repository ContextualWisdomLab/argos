import { describe, expect, it, vi, beforeEach } from 'vitest'

// server-only 목 설정
vi.mock('server-only', () => ({}))

// NextResponse 목(Mock) 설정
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: unknown, init?: unknown) => ({ body, init }),
    },
  }
})

// DB 목(Mock) 설정
vi.mock('@/lib/server/db', () => ({
  db: {
    cliAuthRequest: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

// 대상 모듈 임포트
import { POST } from './route'

describe('POST /api/auth/cli-request', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  it('환경 변수에 NEXT_PUBLIC_SITE_URL이 설정된 경우 해당 값을 사용한다', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com'

    const response = await POST() as { body: { authUrl: string, state: string } }
    const { authUrl, state } = response.body

    expect(authUrl).toBe(`https://custom-site.com/cli-auth?state=${state}`)
  })

  it('환경 변수에 NEXT_PUBLIC_SITE_URL이 없는 경우 로컬호스트를 사용한다', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    const response = await POST() as { body: { authUrl: string, state: string } }
    const { authUrl, state } = response.body

    expect(authUrl).toBe(`http://localhost:3000/cli-auth?state=${state}`)
  })
})
