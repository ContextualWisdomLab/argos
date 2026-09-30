/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { WeekNavigator } from './week-navigator'

// Fix: ReferenceError: React is not defined
globalThis.React = React;

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/org/reports',
  useSearchParams: () => new URLSearchParams(),
}))

describe('WeekNavigator', () => {
  it('includes aria-hidden="true" on decorative icons', () => {
    const { container } = render(
      <WeekNavigator currentIsoKey="2026-W16" label="2026-W16 (4/13~4/19)" isCurrent={true} />
    )

    expect(screen.getByRole('link', { name: '이전 주' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '다음 주' })).toBeInTheDocument()

    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-left, svg.lucide-chevron-right')
    expect(chevronIcons.length).toBeGreaterThan(0)
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
