import { BCRYPT_MAX_PASSWORD_BYTES } from '@argos/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  comparePassword: vi.fn(),
  findUser: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('bcryptjs', () => ({
  default: {
    compare: mocks.comparePassword,
    hash: vi.fn(),
  },
}))
vi.mock('./db', () => ({
  db: {
    user: { findUnique: mocks.findUser },
    cliToken: { create: vi.fn() },
  },
}))
vi.mock('./jwt', () => ({ signJwt: vi.fn() }))

import { loginUser } from './auth-actions.js'

describe('loginUser password resource boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a bcrypt-truncated password before database lookup or hash work', async () => {
    await expect(
      loginUser({
        email: 'attacker@example.com',
        password: 'x'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1),
      }),
    ).resolves.toBeNull()

    expect(mocks.findUser).not.toHaveBeenCalled()
    expect(mocks.comparePassword).not.toHaveBeenCalled()
  })

  it('measures multilingual passwords in UTF-8 bytes before database lookup', async () => {
    await expect(
      loginUser({
        email: 'attacker@example.com',
        password: '한'.repeat(25),
      }),
    ).resolves.toBeNull()

    expect(mocks.findUser).not.toHaveBeenCalled()
    expect(mocks.comparePassword).not.toHaveBeenCalled()
  })
})
