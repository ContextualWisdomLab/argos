import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock 'server-only' before importing modules that use it
vi.mock('server-only', () => ({}))

import { db } from './db'
import { loginUser } from './auth-actions'
import * as jwt from './jwt'

vi.mock('./db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    cliToken: {
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

vi.mock('./jwt', () => ({
  signJwt: vi.fn(),
}))

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('성공적으로 로그인하면 AuthResult를 반환한다', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
    }

    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(jwt.signJwt).mockResolvedValue('mock-jwt-token')

    const result = await loginUser({ email: 'test@example.com', password: 'password123' })

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password')
    expect(jwt.signJwt).toHaveBeenCalledWith('user-123')
    expect(db.cliToken.create).toHaveBeenCalled()

    expect(result).not.toBeNull()
    expect(result?.token).toBe('mock-jwt-token')
    expect(result?.user.id).toBe('user-123')
    expect(result?.user.email).toBe('test@example.com')
  })

  it('비밀번호가 틀리면 null을 반환한다', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
    }

    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const result = await loginUser({ email: 'test@example.com', password: 'wrongpassword' })

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password')
    expect(result).toBeNull()
  })

  it('사용자가 존재하지 않으면 타이밍 방어(dummy compare) 후 null을 반환한다', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const result = await loginUser({ email: 'notfound@example.com', password: 'password123' })

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } })
    // Verify that dummy hash compare is called to mitigate timing attack
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', expect.any(String))
    expect(result).toBeNull()
  })
})
