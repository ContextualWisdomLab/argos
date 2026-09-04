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
    vi.restoreAllMocks()
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    })
  })

  it('opens an http URL on win32 without a command shell or console disclosure', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockApiRequest = vi.mocked(apiRequest)
    const authUrl = 'https://example.com/login?state=state123&next=one|two;three%5Efour'
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl }) // Step 1
    mockApiRequest.mockResolvedValueOnce({ token: 'token123' }) // Step 3
    mockApiRequest.mockResolvedValueOnce({ user: { id: 'u1', name: 'User1' } }) // Step 5

    await runLoginFlow('http://api')

    expect(childProcess.spawn).toHaveBeenCalledWith(
      'explorer.exe',
      [authUrl],
      { detached: true, stdio: 'ignore' }
    )
    expect(childProcess.spawn).not.toHaveBeenCalledWith(
      'cmd.exe',
      expect.anything(),
      expect.anything()
    )
    for (const call of vi.mocked(console.log).mock.calls) {
      expect(call.join(' ')).not.toContain(authUrl)
      expect(call.join(' ')).not.toContain('state123')
    }
  })

  it('rejects URLs with invalid protocols without reflecting the rejected URL', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    const rejectedUrl = 'file:///etc/passwd?secret=do-not-reflect'
    mockApiRequest.mockResolvedValueOnce({ state: 'state123', authUrl: rejectedUrl }) // Step 1

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(runLoginFlow('http://test-api')).rejects.toThrow('Invalid URL protocol')
    expect(errorSpy).toHaveBeenCalled()
    for (const call of errorSpy.mock.calls) {
      expect(call.join(' ')).not.toContain(rejectedUrl)
    }
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

    expect(childProcess.spawn).toHaveBeenCalledWith('xdg-open', ['http://api.example/url'].replace('api.', ''), { detached: true, stdio: 'ignore' })
  })

  it('throws an error if step 1 fails', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

    await expect(runLoginFlow('http://api')).rejects.toThrow('인증 요청 실패: Network error')
  })
})
