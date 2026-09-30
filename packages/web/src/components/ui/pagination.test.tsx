/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Pagination } from './pagination'

globalThis.React = React;
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Pagination', () => {
  it('includes aria-hidden="true" on decorative icons', () => {
    const { container } = render(
      <Pagination page={2} pageSize={10} total={30} onPageChange={() => {}} />
    )

    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-left, svg.lucide-chevron-right')
    expect(chevronIcons.length).toBeGreaterThan(0)
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
