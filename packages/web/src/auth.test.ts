import { describe, expect, it, vi, beforeEach } from 'vitest'

// Create a stable reference to track NextAuth config
const capturedConfig: any = { value: null }

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
vi.mock('next-auth', () => {
  return {
    default: vi.fn((config) => {
      capturedConfig.value = config // Capture the config passed to NextAuth
      return {
        handlers: {},
        signIn: vi.fn(),
        signOut: vi.fn(),
        auth: vi.fn(),
      }
    }),
  }
})
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((opts) => opts),
}))

describe('NextAuth Configuration Security', () => {
  let authorize: any
  let loginUser: any
  let verifyAdminImpersonationToken: any
  let issueUserAuthResult: any

  beforeEach(async () => {
    vi.resetModules()
    const authActions = await import('./lib/server/auth-actions')
    loginUser = vi.mocked(authActions.loginUser)
    issueUserAuthResult = vi.mocked(authActions.issueUserAuthResult)

    const adminAuth = await import('./lib/server/admin-auth')
    verifyAdminImpersonationToken = vi.mocked(adminAuth.verifyAdminImpersonationToken)

    await import('./auth')
    const config = capturedConfig.value
    if (!config) {
        throw new Error('Config missing from mock')
    }

    // Grab the authorize callback from the credentials provider
    authorize = config.providers[0].authorize
  })

  it('rejects passwords longer than PASSWORD_INPUT_MAX_CHARACTERS', async () => {
    const { PASSWORD_INPUT_MAX_CHARACTERS } = await import('@argos/shared')
    const overlyLongPassword = 'x'.repeat(PASSWORD_INPUT_MAX_CHARACTERS + 1)

    const result = await authorize({
      email: 'test@example.com',
      password: overlyLongPassword
    })

    expect(result).toBeNull()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('allows passwords within PASSWORD_INPUT_MAX_CHARACTERS', async () => {
    const { PASSWORD_INPUT_MAX_CHARACTERS } = await import('@argos/shared')
    const validPassword = 'x'.repeat(PASSWORD_INPUT_MAX_CHARACTERS)

    loginUser.mockResolvedValueOnce({
      token: 'fake-token',
      user: { id: '1' }
    })

    const result = await authorize({
      email: 'test@example.com',
      password: validPassword
    })

    expect(result).not.toBeNull()
    expect(loginUser).toHaveBeenCalled()
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
      user: { id: 'user-1' }
    })

    const result = await authorize({ impersonationToken: 'valid-token' })
    expect(result).not.toBeNull()
    expect(result.id).toBe('user-1')
    expect(result.argosToken).toBe('impersonation-token')
  })

  it('rejects invalid admin impersonation tokens', async () => {
    verifyAdminImpersonationToken.mockReturnValueOnce(null)

    const result = await authorize({ impersonationToken: 'invalid-token' })
    expect(result).toBeNull()
  })

  it('handles impersonation token issue failures', async () => {
    verifyAdminImpersonationToken.mockReturnValueOnce('user-1')
    issueUserAuthResult.mockResolvedValueOnce(null)

    const result = await authorize({ impersonationToken: 'valid-token' })
    expect(result).toBeNull()
  })

  it('rejects failed loginUser result', async () => {
    const { PASSWORD_INPUT_MAX_CHARACTERS } = await import('@argos/shared')
    const validPassword = 'x'.repeat(PASSWORD_INPUT_MAX_CHARACTERS)

    loginUser.mockResolvedValueOnce(null)

    const result = await authorize({
      email: 'test@example.com',
      password: validPassword
    })

    expect(result).toBeNull()
    expect(loginUser).toHaveBeenCalled()
  })
})
