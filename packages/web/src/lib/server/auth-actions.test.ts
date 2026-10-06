/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import bcrypt from 'bcryptjs'
import { loginUser } from './auth-actions.js'
import { db } from './db.js'

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  }
}))

vi.mock('./db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('./jwt.js', () => ({
  signJwt: vi.fn().mockResolvedValue('fake-jwt'),
}))

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs mock hash when user is not found to prevent timing attacks', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  it('does not perform mock hash if user is found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'realhash',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

    await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    expect(bcrypt.hash).not.toHaveBeenCalled()
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'realhash')
  })
})
