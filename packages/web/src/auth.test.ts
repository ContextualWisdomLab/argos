import { beforeEach, describe, expect, it, vi } from 'vitest'

const capturedConfig: { value: unknown } = { value: null }

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    cliToken: { create: vi.fn() },
  },
}))
vi.mock('./lib/server/jwt', () => ({ signJwt: vi.fn() }))
vi.mock('./lib/server/admin-auth', () => ({
  verifyAdminImpersonationToken: vi.fn(),
}))
vi.mock('./lib/server/auth-actions', () => ({
  issueUserAuthResult: vi.fn(),
  loginUser: vi.fn(),
}))
vi.mock('next-auth', () => ({
  default: vi.fn((config) => {
    capturedConfig.value = config
    return {
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    }
  }),
}))
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((options) => options),
}))

describe('NextAuth credentials adapter', () => {
  let authorize: (...args: unknown[]) => Promise<unknown>
  let loginUser: import('vitest').Mock
  let verifyAdminImpersonationToken: import('vitest').Mock
  let issueUserAuthResult: import('vitest').Mock

  beforeEach(async () => {
    vi.resetModules()
    const authActions = await import('./lib/server/auth-actions.js')
    loginUser = vi.mocked(authActions.loginUser)
    issueUserAuthResult = vi.mocked(authActions.issueUserAuthResult)

    const adminAuth = await import('./lib/server/admin-auth.js')
    verifyAdminImpersonationToken = vi.mocked(adminAuth.verifyAdminImpersonationToken)

    await import('./auth.js')
    const config = capturedConfig.value as {
      providers: [{ authorize: (...args: unknown[]) => Promise<unknown> }]
    }
    if (!config) throw new Error('NextAuth configuration was not captured')
    authorize = config.providers[0].authorize
  })

  it('rejects credentials above the shared coarse work bound before loginUser', async () => {
    const { PASSWORD_INPUT_MAX_CHARACTERS } = await import('@argos/shared')

    const result = await authorize({
      email: 'test@example.com',
      password: 'x'.repeat(PASSWORD_INPUT_MAX_CHARACTERS + 1),
    })

    expect(result).toBeNull()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('rejects a 73-byte password before loginUser', async () => {
    const result = await authorize({
      email: 'test@example.com',
      password: 'x'.repeat(73),
    })

    expect(result).toBeNull()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('passes a 72-byte password admitted by the shared contract to loginUser', async () => {
    const password = 'x'.repeat(72)
    loginUser.mockResolvedValueOnce({ token: 'fake-token', user: { id: '1' } })

    const result = await authorize({ email: 'test@example.com', password })

    expect(result).not.toBeNull()
    expect(loginUser).toHaveBeenCalledWith({ email: 'test@example.com', password })
  })

  it('rejects missing or invalid credentials', async () => {
    expect(await authorize({})).toBeNull()
    expect(await authorize({ email: 'test@example.com' })).toBeNull()
    expect(await authorize({ password: 'pass' })).toBeNull()
    expect(await authorize({ email: 123, password: 'pass' })).toBeNull()
  })

  it('supports valid admin impersonation tokens', async () => {
    verifyAdminImpersonationToken.mockReturnValueOnce('user-1')
    issueUserAuthResult.mockResolvedValueOnce({
      token: 'impersonation-token',
      user: { id: 'user-1' },
    })

    const result = await authorize({ impersonationToken: 'valid-token' })

    expect(result).not.toBeNull()
    expect((result as { id: string }).id).toBe('user-1')
    expect((result as { argosToken: string }).argosToken).toBe('impersonation-token')
  })

  it('rejects invalid admin impersonation tokens', async () => {
    verifyAdminImpersonationToken.mockReturnValueOnce(null)

    expect(await authorize({ impersonationToken: 'invalid-token' })).toBeNull()
  })

  it('rejects impersonation when issuing the user auth result fails', async () => {
    verifyAdminImpersonationToken.mockReturnValueOnce('user-1')
    issueUserAuthResult.mockResolvedValueOnce(null)

    expect(await authorize({ impersonationToken: 'valid-token' })).toBeNull()
  })

  it('returns null when loginUser rejects otherwise admitted credentials', async () => {
    loginUser.mockResolvedValueOnce(null)

    const result = await authorize({
      email: 'test@example.com',
      password: 'valid-password',
    })

    expect(result).toBeNull()
    expect(loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'valid-password',
    })
  })
})
