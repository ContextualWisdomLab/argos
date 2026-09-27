/** @vitest-environment jsdom */
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { OverviewStats } from './overview-stats'
import { SessionFilesSummary } from './session-files'
import type { SessionFiles } from '@/lib/session-files'

beforeEach(() => {
  vi.stubGlobal('React', React)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('dashboard summary accessibility labels', () => {
  it('keeps the visible overview label in the accessible name while aria-expanded exposes state', async () => {
    const user = userEvent.setup()
    render(
      <OverviewStats
        periodLabel="Today"
        sessions={1}
        turns={2}
        inputTokens={3}
        outputTokens={4}
        cacheReadTokens={5}
        cacheCreationTokens={6}
        estimatedCostUsd={0.01}
      />,
    )

    const toggle = screen.getByRole('button', {
      name: 'What do these numbers mean?',
    })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(
      screen.getByRole('button', {
        name: 'What do these numbers mean?',
      }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps each visible file-summary label in its accessible action name', async () => {
    const user = userEvent.setup()
    const onOpenFilesTab = vi.fn()
    const files: SessionFiles = {
      modified: [
        {
          path: 'src/changed.ts',
          count: 1,
          firstEventIdx: 0,
          lastEventIdx: 0,
          lastTimestamp: '2026-08-15T00:00:00Z',
        },
      ],
      read: [
        {
          path: 'README.md',
          count: 1,
          firstEventIdx: 1,
          lastEventIdx: 1,
          lastTimestamp: '2026-08-15T00:01:00Z',
        },
      ],
    }

    render(
      <SessionFilesSummary
        files={files}
        onOpenFilesTab={onOpenFilesTab}
      />,
    )

    const modified = screen.getByRole('button', {
      name: /^1 file modified.*view modified files$/i,
    })
    const read = screen.getByRole('button', {
      name: /^1 file read.*view read files$/i,
    })

    expect(modified).toHaveAccessibleName(/^1 file modified.*view modified files$/i)
    expect(read).toHaveAccessibleName(/^1 file read.*view read files$/i)

    await user.click(modified)
    await user.click(read)

    expect(onOpenFilesTab).toHaveBeenCalledTimes(2)
  })
})
