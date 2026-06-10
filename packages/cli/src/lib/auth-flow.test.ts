import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runLoginFlow } from './auth-flow.js'
import { apiRequest } from './api-client.js'
import { exec } from 'child_process'
import ora from 'ora'

// Mock dependencies
vi.mock('child_process', () => ({
  exec: vi.fn(),
}))

vi.mock('./api-client.js', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}))

vi.mock('chalk', () => ({
  default: {
    green: vi.fn((str) => str),
  },
}))

describe('runLoginFlow', () => {
  const mockApiUrl = 'http://test.local'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes the login flow successfully', async () => {
    const mockApiRequest = vi.mocked(apiRequest)

    mockApiRequest.mockResolvedValueOnce({
      state: 'test-state',
      authUrl: 'http://test.local/auth',
    })

    mockApiRequest.mockResolvedValueOnce({
      pending: true,
    })
    mockApiRequest.mockResolvedValueOnce({
      token: 'test-token',
    })

    mockApiRequest.mockResolvedValueOnce({
      user: { id: 'u1', email: 'test@example.com' },
    })

    const flowPromise = runLoginFlow(mockApiUrl)

    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(2000)

    const result = await flowPromise

    expect(result).toEqual({
      token: 'test-token',
      user: { id: 'u1', email: 'test@example.com' },
    })

    expect(exec).toHaveBeenCalled()
    expect(ora).toHaveBeenCalled()
    expect(mockApiRequest).toHaveBeenCalledTimes(4)
  })

  it('throws an error if step 1 fails', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'))

    await expect(runLoginFlow(mockApiUrl)).rejects.toThrow('인증 요청 실패: Network error')
  })

  it('handles polling denial', async () => {
    const mockApiRequest = vi.mocked(apiRequest)

    mockApiRequest.mockResolvedValueOnce({
      state: 'test-state',
      authUrl: 'http://test.local/auth',
    })

    mockApiRequest.mockResolvedValueOnce({
      denied: true,
    })

    const flowPromise = runLoginFlow(mockApiUrl)
    const assertionPromise = expect(flowPromise).rejects.toThrow('로그인이 거부되었습니다.')

    await vi.advanceTimersByTimeAsync(2000)

    await assertionPromise
  })

  it('handles polling timeout after max attempts', async () => {
    const mockApiRequest = vi.mocked(apiRequest)

    mockApiRequest.mockResolvedValueOnce({
      state: 'test-state',
      authUrl: 'http://test.local/auth',
    })

    mockApiRequest.mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('cli-poll')) {
        return Promise.resolve({ pending: true })
      }
      return Promise.resolve({})
    })

    const flowPromise = runLoginFlow(mockApiUrl)
    const assertionPromise = expect(flowPromise).rejects.toThrow('로그인 시간이 초과되었습니다.')

    // 450 times
    await vi.advanceTimersByTimeAsync(451 * 2000)

    await assertionPromise
  })

  it('ignores temporary errors during polling and continues', async () => {
    const mockApiRequest = vi.mocked(apiRequest)

    mockApiRequest.mockResolvedValueOnce({
      state: 'test-state',
      authUrl: 'http://test.local/auth',
    })

    mockApiRequest.mockRejectedValueOnce(new Error('Temporary network error'))
    mockApiRequest.mockResolvedValueOnce({
      token: 'test-token',
    })

    mockApiRequest.mockResolvedValueOnce({
      user: { id: 'u1' },
    })

    const flowPromise = runLoginFlow(mockApiUrl)

    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(2000)

    const result = await flowPromise

    expect(result).toEqual({
      token: 'test-token',
      user: { id: 'u1' },
    })
  })
})
