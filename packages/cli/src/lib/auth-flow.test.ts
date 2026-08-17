import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { normalizeBrowserUrl, runLoginFlow } from './auth-flow.js'
import { apiRequest } from './api-client.js'
import * as childProcess from 'child_process'

// Mock dependencies
vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    unref: vi.fn(),
  })),
}))

// Mock ora and console
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn(() => ({
      succeed: vi.fn(),
      fail: vi.fn(),
    })),
  })),
}))
console.log = vi.fn()

describe('auth-flow', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    })
  })

  it('opens a normalized HTTP URL with explorer.exe on win32 without cmd.exe', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({
      state: 'state123',
      authUrl: 'https://example.com/cli-auth?state=a%26b',
    })
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' })
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } })

    await runLoginFlow('https://api.example.com')

    expect(childProcess.spawn).toHaveBeenCalledWith(
      'explorer.exe',
      ['https://example.com/cli-auth?state=a%26b'],
      { detached: true, stdio: 'ignore', windowsHide: true }
    )
    expect(childProcess.spawn).not.toHaveBeenCalledWith(
      'cmd.exe',
      expect.anything(),
      expect.anything()
    )
  })

  it('opens browser using open on darwin safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/url' })
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' })
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } })

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith('open', ['http://example.com/url'], { detached: true, stdio: 'ignore' })
  })

  it('opens browser using xdg-open on linux safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/url' })
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' })
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } })

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith('xdg-open', ['http://example.com/url'], { detached: true, stdio: 'ignore' })
  })

  it.each([
    'javascript:alert(1)',
    'file:///etc/passwd',
    'data:text/html,unsafe',
    'mailto:attacker@example.com',
    'not a URL',
  ])('rejects non-HTTP browser targets: %s', (candidate) => {
    expect(() => normalizeBrowserUrl(candidate)).toThrow('Invalid browser URL')
  })

  it('rejects embedded credentials and control characters', () => {
    expect(() => normalizeBrowserUrl('https://user:secret@example.com/login')).toThrow(
      'Invalid browser URL'
    )
    expect(() => normalizeBrowserUrl('https://example.com/\u0000login')).toThrow(
      'Invalid browser URL'
    )
  })

  it('returns a canonical HTTP(S) URL for the launcher', () => {
    expect(normalizeBrowserUrl('HTTPS://Example.COM:443/a/../cli-auth?state=abc')).toBe(
      'https://example.com/cli-auth?state=abc'
    )
  })

  it('throws an error if step 1 fails', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

    await expect(runLoginFlow('http://api')).rejects.toThrow('인증 요청 실패: Network error')
  })
})
