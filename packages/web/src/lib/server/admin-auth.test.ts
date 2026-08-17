import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return {
    ...actual,
    createHash: vi.fn(actual.createHash),
  }
})

const RUNTIME_ENV_KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'ADMIN_COOKIE_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
] as const

const originalEnv = new Map(RUNTIME_ENV_KEYS.map((key) => [key, process.env[key]]))

function setRuntimeEnv() {
  process.env.DATABASE_URL = 'postgresql://argos:argos@localhost:5432/argos'
  process.env.DIRECT_URL = 'postgresql://argos:argos@localhost:5432/argos'
  process.env.JWT_SECRET = 'j'.repeat(32)
  process.env.ADMIN_COOKIE_SECRET = 'c'.repeat(32)
  process.env.ADMIN_USERNAME = 'admin'
  process.env.ADMIN_PASSWORD = 'correct horse battery staple'
}

function restoreRuntimeEnv() {
  for (const [key, value] of originalEnv) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

async function importAdminAuth() {
  vi.resetModules()
  return import('./admin-auth.js')
}

async function getCreateHashMock() {
  const crypto = await import('crypto')
  return vi.mocked(crypto.createHash)
}

beforeEach(() => {
  setRuntimeEnv()
  vi.clearAllMocks()
})

afterEach(() => {
  restoreRuntimeEnv()
  vi.resetModules()
})

describe('verifyAdminCredentials', () => {
  it('accepts the configured admin credentials with uniform fast hashes', async () => {
    const { verifyAdminCredentials } = await importAdminAuth()
    const createHash = await getCreateHashMock()

    await expect(
      verifyAdminCredentials({
        username: 'admin',
        password: 'correct horse battery staple',
      }),
    ).resolves.toBe(true)

    expect(createHash).toHaveBeenCalledTimes(2)
    expect(createHash).toHaveBeenNthCalledWith(1, 'sha256')
    expect(createHash).toHaveBeenNthCalledWith(2, 'sha256')
  })

  it('rejects incorrect passwords without PBKDF2-style expensive work', async () => {
    const { verifyAdminCredentials } = await importAdminAuth()
    const createHash = await getCreateHashMock()

    await expect(
      verifyAdminCredentials({
        username: 'admin',
        password: 'incorrect password value',
      }),
    ).resolves.toBe(false)

    expect(createHash).toHaveBeenCalledTimes(2)
  })

  it('short-circuits unknown usernames before hashing attacker-controlled input', async () => {
    const { verifyAdminCredentials } = await importAdminAuth()
    const createHash = await getCreateHashMock()

    await expect(
      verifyAdminCredentials({
        username: 'not-admin',
        password: 'x'.repeat(2048),
      }),
    ).resolves.toBe(false)

    expect(createHash).not.toHaveBeenCalled()
  })

  it('short-circuits overlength passwords before hashing attacker-controlled input', async () => {
    const { verifyAdminCredentials } = await importAdminAuth()
    const createHash = await getCreateHashMock()

    await expect(
      verifyAdminCredentials({
        username: 'admin',
        password: 'x'.repeat(1025),
      }),
    ).resolves.toBe(false)

    expect(createHash).not.toHaveBeenCalled()
  })
})

describe('requireAdmin', () => {
  it('returns the standard unauthorized error without an admin session', async () => {
    const { requireAdmin } = await importAdminAuth()
    const response = requireAdmin(new NextRequest('https://argos.example/api/admin/users'))

    expect(response).not.toBeNull()
    expect(response?.status).toBe(401)
    await expect(response?.json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    })
  })
})
