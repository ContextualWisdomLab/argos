import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runLoginFlow } from './auth-flow.js'
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
      configurable: true,
    })
  })

  it('opens browser using start on win32 safely with spawn and uses normalized href to prevent newline injection', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })

    const mockApiRequest = vi.mocked(apiRequest)
    // URL with raw newlines and unescaped spaces/metacharacters to test normalization and escaping
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/&\ncalc|\rrm' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    // new URL(...) completely removes '\n' and '\r' internally so the resulting href won't have them
    expect(childProcess.spawn).toHaveBeenCalledWith(
      'cmd.exe',
      ['/c', 'start', '""', 'http://example.com/^&calc^|rm'],
      { windowsVerbatimArguments: true, detached: true, stdio: 'ignore' }
    )
  })

  it('throws an error for non-http(s) protocols to prevent injection via custom URI schemes', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'file:///etc/passwd' }) // Step 1

    await expect(runLoginFlow('http://api')).rejects.toThrow('지원하지 않는 프로토콜입니다: file:')
  })

  it('opens browser using open on darwin safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/url' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith('open', ['http://example.com/url'], { detached: true, stdio: 'ignore' })
  })

  it('opens browser using xdg-open on linux safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/url' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith('xdg-open', ['http://example.com/url'], { detached: true, stdio: 'ignore' })
  })

  it('throws an error if step 1 fails', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

    await expect(runLoginFlow('http://api')).rejects.toThrow('인증 요청 실패: Network error')
  })
})
