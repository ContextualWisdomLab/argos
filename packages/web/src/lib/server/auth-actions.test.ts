/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock `server-only` before importing `auth-actions`
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
    hash: vi.fn().mockResolvedValue('dummyhash'),
    compare: vi.fn(),
  },
}))

vi.mock('./jwt.js', () => ({
  signJwt: vi.fn().mockResolvedValue('jwt_token'),
}))

describe('auth-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginUser', () => {
    it('returns null if password length exceeds 1024', async () => {
      const longPassword = 'A'.repeat(1025)
      const result = await loginUser({ email: 'test@example.com', password: longPassword })
      expect(result).toBeNull()
      expect(db.user.findUnique).not.toHaveBeenCalled()
    })

    it('returns EMAIL_IN_USE if password length exceeds 1024 for registerUser', async () => {
      const longPassword = 'A'.repeat(1025);
      const result = await registerUser({ email: 'test@example.com', password: longPassword, name: 'Test User' });
      expect(result).toBe('EMAIL_IN_USE');
      expect(db.user.findUnique).not.toHaveBeenCalled();
    })
  })

  describe('loginUser', () => {
    it('returns null and simulates delay if user is not found', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)
      const password = 'mypassword'
      const result = await loginUser({ email: 'notfound@example.com', password })
      expect(result).toBeNull()
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })
  })
})
