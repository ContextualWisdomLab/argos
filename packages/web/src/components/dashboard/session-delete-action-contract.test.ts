/** @vitest-environment node */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildSessionDeleteLabel } from '../../lib/session-action-labels'

const sessionsPage = readFileSync(
  resolve(process.cwd(), 'src/app/dashboard/[orgSlug]/sessions/page.tsx'),
  'utf-8',
)

describe('session delete action accessibility contract', () => {
  it('builds one target-specific label from normalized session text', () => {
    expect(buildSessionDeleteLabel('/review   current changes')).toBe(
      '세션 삭제: /review current changes',
    )
    expect(
      buildSessionDeleteLabel(
        '<command-message>review</command-message><command-name>/review</command-name><command-args> current   changes </command-args>',
      ),
    ).toBe('세션 삭제: /review current changes')
  })

  it.each([undefined, null, '', '   ', '\n\t'])(
    'falls back to the stable action name when the normalized title is %s',
    (title) => {
      expect(buildSessionDeleteLabel(title)).toBe('세션 삭제')
    },
  )

  it('uses the same reviewed helper for the accessible name and pointer tooltip', () => {
    expect(sessionsPage).toContain('const deleteLabel = buildSessionDeleteLabel(session.title)')
    expect(sessionsPage).toContain('aria-label={deleteLabel}')
    expect(sessionsPage).toContain('title={deleteLabel}')
  })
})
