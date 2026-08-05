import { BCRYPT_MAX_PASSWORD_BYTES } from '@argos/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findResetToken: vi.fn(),
  hashPassword: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('bcryptjs', () => ({
  default: { hash: mocks.hashPassword },
}))
vi.mock('./db', () => ({
  db: {
    passwordResetToken: { findUnique: mocks.findResetToken },
  },
}))

import { resetPasswordWithToken } from './password-reset.js'

describe('resetPasswordWithToken password resource boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects bcrypt-truncated input before token lookup or password hashing', async () => {
    await expect(
      resetPasswordWithToken({
        token: 'reset-token',
        password: 'x'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1),
      }),
    ).rejects.toMatchObject({ name: 'ZodError' })

    expect(mocks.findResetToken).not.toHaveBeenCalled()
    expect(mocks.hashPassword).not.toHaveBeenCalled()
  })
})
