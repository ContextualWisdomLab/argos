// @vitest-environment jsdom
import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WeekNavigator } from './week-navigator'

// Add React to global for JSX transpilation issues in some environments
globalThis.React = React

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}))

describe('WeekNavigator accessibility', () => {
  it('hides chevron icons from screen readers', () => {
    const { container } = render(
      <WeekNavigator currentIsoKey="2026-W16" label="2026-W16 (4/13~4/19)" isCurrent={true} />
    )

    const prevIcon = container.querySelector('svg.lucide-chevron-left')
    const nextIcon = container.querySelector('svg.lucide-chevron-right')

    expect(prevIcon?.getAttribute('aria-hidden')).toBe('true')
    expect(nextIcon?.getAttribute('aria-hidden')).toBe('true')
  })
})
