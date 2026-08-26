import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const DATE_RANGE_PAGES = ['overview', 'skills', 'agents', 'users'] as const

function readDashboardPage(page: (typeof DATE_RANGE_PAGES)[number]): string {
  return readFileSync(
    resolve(process.cwd(), `src/app/dashboard/[orgSlug]/${page}/page.tsx`),
    'utf8',
  )
}

describe('dashboard date-range consumers', () => {
  it.each(DATE_RANGE_PAGES)(
    '%s uses the shared validated interval for displayed and queried data',
    (page) => {
      const source = readDashboardPage(page)

      expect(source).toContain(
        "import { resolveSessionDateRange } from '@/lib/session-date-range'",
      )
      expect(source).toMatch(
        /resolveSessionDateRange\(\s*searchParams\.get\('from'\),\s*searchParams\.get\('to'\)/,
      )
      expect(source).not.toMatch(/searchParams\.get\('from'\)\s*\|\|/)
      expect(source).not.toMatch(/searchParams\.get\('to'\)\s*\|\|/)
    },
  )
})
