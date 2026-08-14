/** @vitest-environment jsdom */
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { OverviewStats } from './overview-stats'
import { SessionFilesSummary } from './session-files'
import type { SessionFiles } from '@/lib/session-files'

afterEach(() => {
  cleanup()
})

describe('dashboard summary accessibility labels', () => {
  it('names the overview toggle by the action it will perform', async () => {
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

    const showButton = screen.getByRole('button', {
      name: 'Show overview statistics explanation',
    })
    expect(showButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(showButton)

    expect(
      screen.getByRole('button', {
        name: 'Hide overview statistics explanation',
      }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('names both file summary actions without relying on icons', async () => {
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

    await user.click(screen.getByRole('button', { name: 'View modified files' }))
    await user.click(screen.getByRole('button', { name: 'View read files' }))

    expect(onOpenFilesTab).toHaveBeenCalledTimes(2)
  })
})
