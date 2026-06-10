import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'fs'
import {
  normalizeApiUrl,
  getConfigPath,
  readConfig,
  writeConfig,
  deleteConfig,
  requireAuth
} from './config.js'

vi.mock('os', () => ({ homedir: () => '/home/mock' }))
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn()
}))

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('normalizeApiUrl', () => {
    it('returns undefined for empty/null values', () => {
      expect(normalizeApiUrl(undefined)).toBeUndefined()
      expect(normalizeApiUrl(null)).toBeUndefined()
      expect(normalizeApiUrl('')).toBeUndefined()
    })

    it('returns undefined for malformed URLs', () => {
      expect(normalizeApiUrl('not-a-url')).toBeUndefined()
    })

    it('returns undefined for default argos-ai.xyz hosts', () => {
      expect(normalizeApiUrl('https://argos-ai.xyz')).toBeUndefined()
      expect(normalizeApiUrl('https://www.argos-ai.xyz')).toBeUndefined()
      expect(normalizeApiUrl('https://api.argos-ai.xyz')).toBeUndefined()
    })

    it('returns the URL for custom hosts', () => {
      expect(normalizeApiUrl('https://custom.com')).toBe('https://custom.com')
      expect(normalizeApiUrl('http://localhost:3000')).toBe('http://localhost:3000')
    })
  })

  describe('getConfigPath', () => {
    it('returns the correct path', () => {
      expect(getConfigPath()).toMatch(/\/home\/mock\/.argos\/config.json/)
    })
  })

  describe('readConfig', () => {
    it('returns null if config does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      expect(readConfig()).toBeNull()
    })

    it('returns config and normalizes apiUrl', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        token: 'token123',
        apiUrl: 'https://argos-ai.xyz',
        userId: 'user1',
        email: 'test@test.com'
      }))
      const config = readConfig()
      expect(config?.token).toBe('token123')
      expect(config?.apiUrl).toBeUndefined() // normalized to undefined
    })

    it('returns null on JSON parse error', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('invalid-json')
      expect(readConfig()).toBeNull()
    })
  })

  describe('writeConfig', () => {
    it('creates dir and writes config', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      writeConfig({ token: 'test', userId: 'user', email: 'test@test.com' })
      expect(fs.mkdirSync).toHaveBeenCalledWith('/home/mock/.argos', { recursive: true })
      expect(fs.writeFileSync).toHaveBeenCalled()
    })
  })

  describe('deleteConfig', () => {
    it('deletes the config if it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      deleteConfig()
      expect(fs.unlinkSync).toHaveBeenCalled()
    })
  })

  describe('requireAuth', () => {
    it('returns config if valid', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ token: 'test', userId: 'user', email: 'test@test.com' }))
      const config = requireAuth()
      expect(config.token).toBe('test')
    })

    it('exits if config is null', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
      const mockError = vi.spyOn(console, 'error').mockImplementation(() => {})
      requireAuth()
      expect(mockExit).toHaveBeenCalledWith(1)
      expect(mockError).toHaveBeenCalled()
      mockExit.mockRestore()
      mockError.mockRestore()
    })
  })
})
