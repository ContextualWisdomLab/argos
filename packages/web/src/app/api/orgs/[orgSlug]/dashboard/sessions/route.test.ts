import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn(),
  },
}))

vi.mock('@/lib/server/db', () => ({
  db: {
    $queryRaw: vi.fn(),
    claudeSession: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/server/auth-helper', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/server/dashboard-route-helper', () => ({
  assertOrgAccessBySlugOrResponse: vi.fn(),
  resolveOrgScopedProjectIds: vi.fn(),
}))

vi.mock('@/lib/server/rbac', () => ({
  canAccessIndividualData: vi.fn(),
  forbiddenByRole: vi.fn(),
}))

import { _test_exports } from './route'
const { csvField } = _test_exports

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns normal text as is', () => {
    expect(csvField('normal text')).toBe('normal text')
    expect(csvField(123)).toBe('123')
  })

  it('escapes quotes and wraps in quotes if text contains quotes', () => {
    expect(csvField('he said "hello"')).toBe('"he said ""hello"""')
  })

  it('wraps in quotes if text contains commas or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\r\nworld')).toBe('"hello\r\nworld"')
  })

  it('prepends a single quote to prevent CSV injection for =, +, -, @', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
  })
})
