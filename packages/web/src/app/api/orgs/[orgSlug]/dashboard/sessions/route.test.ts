import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('server-only', () => ({}))

import { GET } from './route'
import * as dbLib from '@/lib/server/db'
import * as authHelper from '@/lib/server/auth-helper'
import * as dashboardRouteHelper from '@/lib/server/dashboard-route-helper'
import * as rbac from '@/lib/server/rbac'

// Mock the dependencies
vi.mock('@/lib/server/db', () => ({
  db: {
    claudeSession: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  }
}))

vi.mock('@/lib/server/auth-helper', () => ({
  requireAuth: vi.fn()
}))

vi.mock('@/lib/server/dashboard-route-helper', () => ({
  assertOrgAccessBySlugOrResponse: vi.fn(),
  resolveOrgScopedProjectIds: vi.fn()
}))

vi.mock('@/lib/server/rbac', () => ({
  canAccessIndividualData: vi.fn(),
  forbiddenByRole: vi.fn()
}))

describe('Sessions API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    // Default successful auth and access
    vi.mocked(authHelper.requireAuth).mockResolvedValue({ userId: 'user-1' } as never)
    vi.mocked(dashboardRouteHelper.assertOrgAccessBySlugOrResponse).mockResolvedValue({
      org: { id: 'org-1' },
      role: 'ADMIN'
    } as never)
    vi.mocked(rbac.canAccessIndividualData).mockReturnValue(true)
    vi.mocked(dashboardRouteHelper.resolveOrgScopedProjectIds).mockResolvedValue(['proj-1'])
  })

  it('generates CSV correctly with injected formula fields escaped', async () => {
    const mockSession = {
      id: 'sess-1',
      user: { id: 'user-1', name: '=cmd|\\\' /C calc\\\'!A0' }, // Injection string
      project: { id: 'proj-1', slug: 'p-1', name: '+1+1' }, // Injection string
      usageRecords: [{ inputTokens: 10, outputTokens: 20, estimatedCostUsd: 0.5 }],
      messages: [{ content: '@SUM(1+1)' }], // Injection string
      _count: { events: 1 },
      startedAt: new Date('2025-01-01T00:00:00Z'),
      endedAt: null,
    }

    vi.mocked(dbLib.db.claudeSession.findMany).mockResolvedValue([mockSession] as never)

    const req = new NextRequest('http://localhost/api/orgs/org-1/dashboard/sessions?format=csv&from=2025-01-01&to=2025-01-02')

    const res = await GET(req, { params: Promise.resolve({ orgSlug: 'org-1' }) })
    const text = await res.text()

    // The output should have prepended single quotes for the injection fields
    expect(text).toContain(`'${mockSession.user.name}`)
    expect(text).toContain(`'${mockSession.project.name}`)
    expect(text).toContain(`'${mockSession.messages[0].content}`)
    // Check that numbers are NOT escaped
    expect(text).toContain('10,20,0.5')
  })

  it('does not escape normal fields or numbers', async () => {
    const mockSession = {
      id: 'sess-2',
      user: { id: 'user-1', name: 'Normal User' },
      project: { id: 'proj-1', slug: 'p-1', name: 'Safe Project' },
      usageRecords: [{ inputTokens: 10, outputTokens: 20, estimatedCostUsd: 0.5 }],
      messages: [{ content: 'Hello World' }],
      _count: { events: 5 },
      startedAt: new Date('2025-01-01T00:00:00Z'),
      endedAt: null,
      title: 'Safe Title'
    }

    vi.mocked(dbLib.db.claudeSession.findMany).mockResolvedValue([mockSession] as never)

    const req = new NextRequest('http://localhost/api/orgs/org-1/dashboard/sessions?format=csv&from=2025-01-01&to=2025-01-02')

    const res = await GET(req, { params: Promise.resolve({ orgSlug: 'org-1' }) })
    const text = await res.text()

    // The output should not contain prefixed quotes for normal fields
    expect(text).not.toContain(`'Normal User`)
    expect(text).not.toContain(`'Safe Project`)
    expect(text).not.toContain(`'Hello World`)
    expect(text).not.toContain(`'Safe Title`)

    // The output should just be normal fields
    expect(text).toContain(`Normal User`)
    expect(text).toContain(`Safe Project`)
    expect(text).toContain(`Hello World`)
    expect(text).toContain(`Safe Title`)
  })
})
