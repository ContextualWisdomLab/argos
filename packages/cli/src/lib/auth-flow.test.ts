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

  it('opens browser using start on win32 safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/&calc' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith(
      'cmd.exe',
      ['/c', 'start', '""', 'http://example.com/^&calc'],
      { windowsVerbatimArguments: true, detached: true, stdio: 'ignore' }
    )
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

  it('rejects URLs with invalid protocols', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'file:///etc/passwd' }) // Step 1

    await expect(runLoginFlow('http://api')).rejects.toThrow('잘못된 URL입니다: file:///etc/passwd')
  })

  it('rejects invalid URLs completely', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'not-a-url' }) // Step 1

    await expect(runLoginFlow('http://api')).rejects.toThrow('잘못된 URL입니다: not-a-url')
  })

  it('properly escapes Windows shell metacharacters', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/test?a=1&b=2|c=3;d=4<e>5(f)6^7' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith(
      'cmd.exe',
      ['/c', 'start', '""', 'http://example.com/test?a=1^&b=2^|c=3^;d=4^<e^>5^(f^)6^^7'],
      { windowsVerbatimArguments: true, detached: true, stdio: 'ignore' }
    )
  })
})
