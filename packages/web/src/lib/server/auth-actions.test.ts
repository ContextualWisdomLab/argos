/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'

vi.mock('server-only', () => ({}))

import { db } from './db.js'
import { loginUser, registerUser } from './auth-actions.js'

vi.mock('./db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    cliToken: {
      create: vi.fn(),
    },
    onboardToken: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn().mockResolvedValue(false),
  },
}))

vi.mock('./jwt.js', () => ({
  signJwt: vi.fn().mockResolvedValue('jwt_token'),
}))

describe('auth-actions password boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects bcrypt-truncated login input before database or crypto work', async () => {
    const result = await loginUser({
      email: 'test@example.com',
      password: 'A'.repeat(73),
    })

    expect(result).toBeNull()
    expect(db.user.findUnique).not.toHaveBeenCalled()
    expect(bcrypt.compare).not.toHaveBeenCalled()
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })

  it('rejects multibyte login input by UTF-8 byte length', async () => {
    const result = await loginUser({
      email: 'test@example.com',
      password: '가'.repeat(25),
    })

    expect(result).toBeNull()
    expect(db.user.findUnique).not.toHaveBeenCalled()
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  it('compares unknown-user input with one fixed dummy hash', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const password = 'unknown-user-password'

    const result = await loginUser({
      email: 'missing@example.com',
      password,
    })

    expect(result).toBeNull()
    expect(bcrypt.compare).toHaveBeenCalledOnce()
    expect(bcrypt.compare).toHaveBeenCalledWith(
      password,
      expect.stringMatching(/^\$2[aby]\$10\$/),
    )
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })

  it('uses the stored hash for an existing user', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'existing@example.com',
      name: 'Existing User',
      passwordHash: 'stored-password-hash',
      avatarUrl: null,
      claudePlan: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    })

    const result = await loginUser({
      email: 'existing@example.com',
      password: 'wrong-password',
    })

    expect(result).toBeNull()
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrong-password',
      'stored-password-hash',
    )
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })

  it('rejects invalid registration input instead of reporting a duplicate email', async () => {
    const registration = registerUser({
      email: 'new@example.com',
      password: 'A'.repeat(73),
      name: 'New User',
    })

    await expect(registration).rejects.toThrow(/72 UTF-8 bytes/)
    expect(db.user.findUnique).not.toHaveBeenCalled()
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })
})
