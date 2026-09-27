/** @vitest-environment jsdom */

import React, { type ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WeekNavigator } from './week-navigator'

vi.mock('next/navigation', () => ({
  usePathname: () => '/reports',
  useSearchParams: () => new URLSearchParams('view=summary'),
}))

vi.mock('next/link', async () => {
  const ReactModule = await import('react')

  return {
    default: ({
      href,
      children,
      ...props
    }: {
      href: string
      children: ReactNode
      [key: string]: unknown
    }) => ReactModule.createElement('a', { href, ...props }, children),
  }
})

describe('WeekNavigator accessibility', () => {
  afterEach(cleanup)

  /**
   * Preserves exact link names and query state while keeping both directional
   * icons outside the accessibility tree.
   */
  it('builds labeled previous and next week links with decorative icons', () => {
    render(
      <WeekNavigator
        currentIsoKey="2026-W16"
        label="2026-W16 (4/13~4/19)"
        isCurrent
      />,
    )

    const previous = screen.getByRole('link', { name: '이전 주' })
    const next = screen.getByRole('link', { name: '다음 주' })

    expect(previous).toHaveAttribute(
      'href',
      '/reports?view=summary&week=2026-W15',
    )
    expect(next).toHaveAttribute(
      'href',
      '/reports?view=summary&week=2026-W17',
    )
    expect(previous.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(next.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('진행 중')).toBeInTheDocument()
  })
})
