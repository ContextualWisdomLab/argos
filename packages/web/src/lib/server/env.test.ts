import { afterEach, describe, expect, it, vi } from 'vitest'

const RUNTIME_ENV_KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'ADMIN_COOKIE_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
] as const

const originalEnv = new Map(
  RUNTIME_ENV_KEYS.map((key) => [key, process.env[key]])
)

function clearRuntimeEnv() {
  for (const key of RUNTIME_ENV_KEYS) {
    delete process.env[key]
  }
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

describe('server runtime env', () => {
  afterEach(() => {
    restoreRuntimeEnv()
    vi.resetModules()
  })

  it('does not validate runtime secrets at module import time', async () => {
    clearRuntimeEnv()

    const mod = await import('./env.js')

    expect(mod.getEnv).toEqual(expect.any(Function))
  })

  it('reports missing runtime secrets when they are first accessed', async () => {
    clearRuntimeEnv()
    const { getEnv } = await import('./env.js')

    expect(() => getEnv()).toThrow(/DATABASE_URL/)
  })

  it('uses JWT_SECRET as the admin cookie secret fallback', async () => {
    const secret = 'x'.repeat(32)
    process.env.DATABASE_URL = 'postgresql://argos:argos@localhost:5432/argos'
    process.env.DIRECT_URL = 'postgresql://argos:argos@localhost:5432/argos'
    process.env.JWT_SECRET = secret
    delete process.env.ADMIN_COOKIE_SECRET
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'p'.repeat(16)

    const { getEnv } = await import('./env.js')

    expect(getEnv().ADMIN_COOKIE_SECRET).toBe(secret)
  })
})
