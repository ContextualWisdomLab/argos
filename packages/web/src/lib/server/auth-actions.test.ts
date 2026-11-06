
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

import { loginUser } from './auth-actions.js'
import { db } from './db.js'
import bcrypt from 'bcryptjs'

vi.mock('./db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    cliToken: {
      create: vi.fn(),
    },
  },
}))

vi.mock('./jwt.js', () => ({
  signJwt: vi.fn().mockResolvedValue('test-jwt'),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

describe('loginUser timing attack mitigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hashes password to simulate delay when user is not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  it('compares password when user is found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      name: 'Test',
      createdAt: new Date(),
    })
    vi.mocked(bcrypt.compare).mockResolvedValue(true)

    await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword')
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })
})
