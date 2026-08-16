/** @vitest-environment node */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sessionsPage = readFileSync(
  fileURLToPath(new URL('../../app/dashboard/[orgSlug]/sessions/page.tsx', import.meta.url)),
  'utf-8',
)

describe('session delete action accessibility contract', () => {
  it('identifies the target session for assistive technology and pointer users', () => {
    const dynamicLabel = "aria-label={session.title ? `세션 삭제: ${formatSlashCommandText(session.title)}` : '세션 삭제'}"
    const dynamicTitle = "title={session.title ? `세션 삭제: ${formatSlashCommandText(session.title)}` : '세션 삭제'}"

    expect(sessionsPage).toContain(dynamicLabel)
    expect(sessionsPage).toContain(dynamicTitle)
  })
})
