import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  requireAuth: vi.fn(),
  assertOrgAccessBySlugOrResponse: vi.fn(),
  resolveOrgScopedProjectIds: vi.fn(),
  canAccessIndividualData: vi.fn(),
}))

vi.mock('@/lib/server/db', () => ({
  db: {
    claudeSession: {
      findMany: mocks.findMany,
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/server/auth-helper', () => ({
  requireAuth: mocks.requireAuth,
}))

vi.mock('@/lib/server/dashboard-route-helper', () => ({
  assertOrgAccessBySlugOrResponse: mocks.assertOrgAccessBySlugOrResponse,
  resolveOrgScopedProjectIds: mocks.resolveOrgScopedProjectIds,
}))

vi.mock('@/lib/server/rbac', () => ({
  canAccessIndividualData: mocks.canAccessIndividualData,
  forbiddenByRole: vi.fn(),
}))

import { GET } from './route'

function sessionFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    title: '=1+1',
    agent: 'claude',
    startedAt: new Date('2026-09-01T00:00:00.000Z'),
    endedAt: null,
    user: { id: 'user-1', name: '+SUM(A1:A2)' },
    project: { id: 'project-1', slug: 'project', name: '@project' },
    usageRecords: [{ inputTokens: 12, outputTokens: 34, estimatedCostUsd: 0.5 }],
    messages: [{ content: '\t-1+1' }],
    _count: { events: 5 },
    ...overrides,
  }
}

async function exportCsv() {
  const request = new NextRequest(
    'http://localhost/api/orgs/acme/dashboard/sessions?format=csv&from=2026-09-01&to=2026-09-02',
  )
  return GET(request, { params: Promise.resolve({ orgSlug: 'acme' }) })
}

describe('GET sessions CSV export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAuth.mockResolvedValue({ userId: 'viewer-1' })
    mocks.assertOrgAccessBySlugOrResponse.mockResolvedValue({
      org: { id: 'org-1' },
      role: 'MEMBER',
    })
    mocks.resolveOrgScopedProjectIds.mockResolvedValue(['project-1'])
    mocks.canAccessIndividualData.mockReturnValue(true)
  })

  it('neutralizes ASCII spreadsheet-formula prefixes at the exported-cell boundary', async () => {
    mocks.findMany.mockResolvedValue([sessionFixture()])

    const response = await exportCsv()
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(csv).toContain("'+SUM(A1:A2)")
    expect(csv).toContain("'@project")
    expect(csv).toContain("'=1+1")
    expect(csv).toContain("'\t-1+1")
    expect(csv).toContain(',12,34,0.5,5,')
  })

  it('preserves CJK full-width punctuation that is not an ASCII formula trigger', async () => {
    mocks.findMany.mockResolvedValue([
      sessionFixture({
        id: 'session-2',
        title: '＝literal',
        user: { id: 'user-2', name: '＋team' },
        project: { id: 'project-2', slug: 'project-2', name: '＠project' },
        messages: [{ content: '－not-formula' }],
      }),
    ])

    const response = await exportCsv()
    const csv = await response.text()

    expect(csv).toContain('session-2,＋team,＠project,＝literal,－not-formula,')
    expect(csv).not.toContain("'＋team")
    expect(csv).not.toContain("'＠project")
    expect(csv).not.toContain("'＝literal")
    expect(csv).not.toContain("'－not-formula")
  })

  it('keeps RFC 4180 quoting after formula neutralization', async () => {
    mocks.findMany.mockResolvedValue([
      sessionFixture({
        title: '=HYPERLINK("https://example.test","x")',
        user: { id: 'user-1', name: 'plain-user' },
        project: { id: 'project-1', slug: 'project', name: 'plain-project' },
        messages: [{ content: 'plain prompt' }],
      }),
    ])

    const response = await exportCsv()
    const csv = await response.text()

    expect(csv).toContain('"\'=HYPERLINK(""https://example.test"",""x"")"')
  })
})
