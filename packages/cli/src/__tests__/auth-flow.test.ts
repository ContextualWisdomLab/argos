import { describe, it, expect, vi } from 'vitest'
import { runLoginFlow } from '../lib/auth-flow.js'
import { apiRequest } from '../lib/api-client.js'
import { spawn } from 'child_process'

vi.mock('../lib/api-client.js', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

vi.mock('ora', () => ({
  default: () => ({
    start: () => ({
      succeed: vi.fn(),
    }),
  }),
}))

describe('runLoginFlow', () => {
  it('opens browser using spawn securely', async () => {
    // Mock the state request
    vi.mocked(apiRequest).mockResolvedValueOnce({
      state: 'test-state',
      authUrl: 'http://example.com/auth?token=123',
    })

    // Mock the polling request
    vi.mocked(apiRequest).mockResolvedValueOnce({
      token: 'test-token',
    })

    // Mock the user info request
    vi.mocked(apiRequest).mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
    })

    const spawnMock = vi.mocked(spawn)

    // Save original platform
    const originalPlatform = process.platform

    try {
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      })

      const res = await runLoginFlow('http://api.example.com')

      expect(res.token).toBe('test-token')
      expect(res.user.email).toBe('test@example.com')

      expect(spawnMock).toHaveBeenCalledWith('open', ['http://example.com/auth?token=123'])
    } finally {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      })
    }
  })
})
