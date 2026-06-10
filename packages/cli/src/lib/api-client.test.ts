import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { apiRequest } from './api-client.js';

const server = setupServer(
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ success: true, data: 'test-data' });
  }),
  http.post('https://api.example.com/submit', ({ request }) => {
    return HttpResponse.json({ success: true, method: request.method });
  }),
  http.get('https://api.example.com/error-json', () => {
    return HttpResponse.json({ error: { message: 'Invalid request' } }, { status: 400, statusText: 'Bad Request' });
  }),
  http.get('https://api.example.com/error-json-fallback', () => {
    return HttpResponse.json({ message: 'Alternative error format' }, { status: 400 });
  }),
  http.get('https://api.example.com/error-text', () => {
    return new HttpResponse('Plain text error', { status: 500, statusText: 'Internal Server Error' });
  }),
  http.get('https://api.example.com/error-empty', () => {
    return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
  }),
  http.get('https://api.example.com/timeout', async () => {
    await delay(12000); // Exceeds the 10000ms timeout
    return HttpResponse.json({ success: true });
  }),
  http.get('https://api.example.com/network-error', () => {
    return HttpResponse.error();
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('apiRequest', () => {
  const baseUrl = 'https://api.example.com';

  it('performs a successful GET request with default headers', async () => {
    const result = await apiRequest<{ success: boolean; data: string }>('/data', { baseUrl });
    expect(result).toEqual({ success: true, data: 'test-data' });
  });

  it('merges custom headers correctly', async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.get('https://api.example.com/custom-headers', ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      })
    );

    await apiRequest('/custom-headers', {
      baseUrl,
      headers: { 'X-Custom-Header': 'custom-value' },
    });

    expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    expect(capturedHeaders?.get('X-Custom-Header')).toBe('custom-value');
  });

  it('adds Authorization header if token is provided', async () => {
    let authHeader: string | null = null;
    server.use(
      http.post('https://api.example.com/auth-test', ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return HttpResponse.json({ success: true });
      })
    );

    await apiRequest('/auth-test', {
      baseUrl,
      method: 'POST',
      token: 'test-token',
    });

    expect(authHeader).toBe('Bearer test-token');
  });

  it('handles JSON errors with error.message', async () => {
    await expect(apiRequest('/error-json', { baseUrl })).rejects.toThrowError(
      'API Error (400): Invalid request'
    );
  });

  it('handles JSON errors with top-level message', async () => {
    await expect(apiRequest('/error-json-fallback', { baseUrl })).rejects.toThrowError(
      'API Error (400): Alternative error format'
    );
  });

  it('handles plain text errors', async () => {
    await expect(apiRequest('/error-text', { baseUrl })).rejects.toThrowError(
      'API Error (500): Plain text error'
    );
  });

  it('handles empty response body errors using statusText', async () => {
    await expect(apiRequest('/error-empty', { baseUrl })).rejects.toThrowError(
      'API Error (404): Not Found'
    );
  });

  it('aborts the request after 10 seconds timeout', async () => {
    vi.useFakeTimers();
    const requestPromise = expect(apiRequest('/timeout', { baseUrl })).rejects.toThrowError('API request timed out');

    // Fast-forward time to trigger timeout
    await vi.advanceTimersByTimeAsync(11000);

    await requestPromise;
    vi.useRealTimers();
  });

  it('handles generic network errors', async () => {
    await expect(apiRequest('/network-error', { baseUrl })).rejects.toThrowError(
      'Failed to fetch'
    );
  });

  it('throws unknown API error when a non-Error is thrown', async () => {
    // We can simulate this by mocking global fetch temporarily
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue('String Error');
    await expect(apiRequest('/data', { baseUrl })).rejects.toThrowError('Unknown API error');
    global.fetch = originalFetch;
  });
});
