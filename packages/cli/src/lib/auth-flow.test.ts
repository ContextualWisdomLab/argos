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
    })
  })

  it('opens browser using explorer.exe on win32 safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    // Note: The URL is passed as-is to explorer.exe, Node handles quoting.
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'http://example.com/?a=1&b=2|%TEMP%"calc' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith(
      'explorer.exe',
      ['http://example.com/?a=1&b=2|%TEMP%"calc'],
      { detached: true, stdio: 'ignore' }
    )
  })

  it('fails closed when authUrl protocol is not http or https', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'javascript:alert(1)' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).not.toHaveBeenCalled()
  })

  it('fails closed when authUrl is unparsable', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: 'not-a-url' }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).not.toHaveBeenCalled()
  })

  it('opens browser using open on darwin safely with spawn', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
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
