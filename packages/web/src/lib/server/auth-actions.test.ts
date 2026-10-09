import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

import bcrypt from 'bcryptjs'
import { loginUser } from './auth-actions.js'
import { db } from './db.js'

vi.mock('./db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    cliToken: {
      create: vi.fn(),
    }
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

vi.mock('./jwt.js', () => ({
  signJwt: vi.fn().mockResolvedValue('fake_jwt'),
}))

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call bcrypt.hash when user is not found to prevent timing attacks', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    await loginUser({ email: 'nonexistent@example.com', password: 'password123' })

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
  })

  it('should not call bcrypt.hash when user is found, but should call bcrypt.compare', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      passwordHash: 'stored_hash',
      name: 'Test User',
      createdAt: new Date(),
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true)

    await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(bcrypt.hash).not.toHaveBeenCalled()
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'stored_hash')
  })
})
