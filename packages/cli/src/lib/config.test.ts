import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalizeApiUrl, readConfig, writeConfig, deleteConfig, requireAuth, getConfigPath } from './config.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'


vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
}))

vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home')
}))

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('normalizeApiUrl', () => {
    it('returns undefined for empty/null', () => {
      expect(normalizeApiUrl(undefined)).toBeUndefined()
      expect(normalizeApiUrl(null)).toBeUndefined()
      expect(normalizeApiUrl('')).toBeUndefined()
    })

    it('returns undefined for invalid url', () => {
      expect(normalizeApiUrl('not-a-url')).toBeUndefined()
    })

    it('returns undefined for argos-ai.xyz and subdomains', () => {
      expect(normalizeApiUrl('https://argos-ai.xyz')).toBeUndefined()
      expect(normalizeApiUrl('https://api.argos-ai.xyz')).toBeUndefined()
      expect(normalizeApiUrl('http://foo.bar.argos-ai.xyz')).toBeUndefined()
    })

    it('returns url for other domains', () => {
      expect(normalizeApiUrl('https://my-argos.com')).toBe('https://my-argos.com')
      expect(normalizeApiUrl('http://localhost:3000')).toBe('http://localhost:3000')
    })
  })

  describe('getConfigPath', () => {
    it('returns path based on homedir', () => {
      expect(getConfigPath()).toBe('/mock/home/.argos/config.json')
    })
  })

  describe('readConfig', () => {
    it('returns null if config does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      expect(readConfig()).toBeNull()
    })

    it('returns config and normalizes apiUrl', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        token: 'test',
        userId: '1',
        email: 'test@test.com',
        apiUrl: 'https://argos-ai.xyz'
      }))

      const config = readConfig()
      expect(config).toEqual({
        token: 'test',
        userId: '1',
        email: 'test@test.com'
        // apiUrl should be deleted
      })
    })

    it('keeps valid apiUrl', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        token: 'test',
        userId: '1',
        email: 'test@test.com',
        apiUrl: 'http://localhost:3000'
      }))

      expect(readConfig()?.apiUrl).toBe('http://localhost:3000')
    })

    it('returns null on invalid json', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue('invalid-json')
      expect(readConfig()).toBeNull()
    })
  })

  describe('writeConfig', () => {
    it('creates directory and writes file', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const config = { token: 't', userId: 'u', email: 'e' }
      writeConfig(config)

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.argos', { recursive: true })
      expect(writeFileSync).toHaveBeenCalledWith(
        '/mock/home/.argos/config.json',
        JSON.stringify(config, null, 2),
        'utf8'
      )
    })
  })

  describe('deleteConfig', () => {
    it('unlinks file if it exists', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      deleteConfig()
      expect(unlinkSync).toHaveBeenCalledWith('/mock/home/.argos/config.json')
    })

    it('does not unlink if file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      deleteConfig()
      expect(unlinkSync).not.toHaveBeenCalled()
    })

    it('ignores errors when unlinking', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(unlinkSync).mockImplementation(() => {
        throw new Error('Test error')
      })

      expect(() => deleteConfig()).not.toThrow()
    })
  })

  describe('requireAuth', () => {
    it('exits if config is missing', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      requireAuth()

      expect(errorSpy).toHaveBeenCalled()
      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it('returns config if valid', () => {
      const mockConfig = { token: 't', userId: 'u', email: 'e' }
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig))

      expect(requireAuth()).toEqual(mockConfig)
    })
  })
})
