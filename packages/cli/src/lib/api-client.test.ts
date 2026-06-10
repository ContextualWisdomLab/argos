import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiRequest } from './api-client.js'

describe('apiRequest', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('makes a successful request and returns JSON data', async () => {
    const mockData = { id: 1, name: 'test' }
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const result = await apiRequest<{ id: number; name: string }>('/test', {})

    expect(global.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
      },
    }))
    expect(result).toEqual(mockData)
  })

  it('constructs URL with baseUrl and includes token', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await apiRequest('/path', {
      baseUrl: 'https://api.example.com',
      token: 'secret-token',
    })

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/path', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer secret-token',
      },
    }))
  })

  it('merges custom headers with default ones', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await apiRequest('/test', {
      headers: {
        'x-custom-header': 'custom-value',
      },
    })

    expect(global.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'x-custom-header': 'custom-value',
      },
    }))
  })

  it('handles JSON error response with error.message', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { message: 'Bad request from JSON' } }),
    } as Response)

    await expect(apiRequest('/test', {})).rejects.toThrow('API Error (400): Bad request from JSON')
  })

  it('handles JSON error response with message', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: 'Not found from JSON' }),
    } as Response)

    await expect(apiRequest('/test', {})).rejects.toThrow('API Error (404): Not found from JSON')
  })

  it('handles text error response (fallback)', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Some raw text error',
    } as Response)

    await expect(apiRequest('/test', {})).rejects.toThrow('API Error (500): Some raw text error')
  })

  it('handles error response without message and empty text', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: async () => '',
    } as Response)

    await expect(apiRequest('/test', {})).rejects.toThrow('API Error (502): Bad Gateway')
  })

  it('throws API request timed out on AbortError', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'

    vi.mocked(global.fetch).mockRejectedValueOnce(abortError)

    await expect(apiRequest('/test', {})).rejects.toThrow('API request timed out')
  })

  it('rethrows unknown network errors', async () => {
    const networkError = new Error('Network failed')
    vi.mocked(global.fetch).mockRejectedValueOnce(networkError)

    await expect(apiRequest('/test', {})).rejects.toThrow('Network failed')
  })

  it('handles timeout correctly (using fake timers)', async () => {
    vi.useFakeTimers()
    const fetchPromise = new Promise<Response>(() => {})

    vi.mocked(global.fetch).mockReturnValueOnce(fetchPromise)

    const requestPromise = apiRequest('/test', {})

    // allow the event loop to clear so fetch is called
    await Promise.resolve()

    // Fast-forward time past the 10s timeout
    await vi.advanceTimersByTimeAsync(10001)

    expect(global.fetch).toHaveBeenCalled()
    const callArgs = vi.mocked(global.fetch).mock.calls[0]
    const options = callArgs[1] as RequestInit

    expect(options.signal).toBeDefined()
    expect(options.signal?.aborted).toBe(true)

    // clean up the unhandled promise
    requestPromise.catch(() => {})
  })
})
