import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn().mockResolvedValue(false),
  },
}))
vi.mock('./db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}))

describe('loginUser', () => {
  it('mitigates timing attack by performing bcrypt hash if user does not exist', async () => {
    const { loginUser } = await import('./auth-actions.js')
    const bcrypt = (await import('bcryptjs')).default

    await loginUser({ email: 'notfound@example.com', password: 'password123' })

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
  })
})
