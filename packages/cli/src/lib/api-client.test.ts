import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { apiRequest } from './api-client.js'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('https://api.example.com/test', () => {
    return HttpResponse.json({ success: true, message: 'Hello' })
  }),
  http.post('https://api.example.com/test-auth', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader === 'Bearer test-token') {
       return HttpResponse.json({ authenticated: true })
    }
    return new HttpResponse('Unauthorized', { status: 401 })
  }),
  http.get('https://api.example.com/error-json', () => {
    return HttpResponse.json({ error: { message: 'Custom JSON Error' } }, { status: 400 })
  }),
  http.get('https://api.example.com/error-text', () => {
    return new HttpResponse('Custom Text Error', { status: 400 })
  }),
  http.get('https://api.example.com/network-error', () => {
    return HttpResponse.error()
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe('apiRequest', () => {
  it('makes a successful request with base URL', async () => {
    const result = await apiRequest<{ success: boolean; message: string }>('/test', {
      baseUrl: 'https://api.example.com',
    })
    expect(result).toEqual({ success: true, message: 'Hello' })
  })

  it('includes auth token and custom headers', async () => {
    const result = await apiRequest<{ authenticated: boolean }>('/test-auth', {
      baseUrl: 'https://api.example.com',
      method: 'POST',
      token: 'test-token',
      headers: {
        'X-Custom-Header': 'CustomValue',
      },
    })
    expect(result).toEqual({ authenticated: true })
  })

  it('handles JSON errors correctly', async () => {
    await expect(
      apiRequest('/error-json', { baseUrl: 'https://api.example.com' })
    ).rejects.toThrow('API Error (400): Custom JSON Error')
  })

  it('handles text errors correctly', async () => {
    await expect(
      apiRequest('/error-text', { baseUrl: 'https://api.example.com' })
    ).rejects.toThrow('API Error (400): Custom Text Error')
  })

  it('handles network errors', async () => {
    await expect(
      apiRequest('/network-error', { baseUrl: 'https://api.example.com' })
    ).rejects.toThrow('Failed to fetch')
  })

  it('handles timeout correctly', async () => {
    // Override global fetch completely to simulate timeout scenario deterministically
    const originalFetch = global.fetch

    // Simulate a fetch that triggers an AbortError synchronously to avoid unhandled async rejection
    // when using fake timers with native fetch. We just inject the abort error.
    global.fetch = vi.fn().mockImplementation(() => {
       const err = new Error('The operation was aborted')
       err.name = 'AbortError'
       return Promise.reject(err)
    })

    const reqPromise = apiRequest('/timeout', { baseUrl: 'https://api.example.com' })

    await expect(reqPromise).rejects.toThrow('API request timed out')

    global.fetch = originalFetch
  })
})
