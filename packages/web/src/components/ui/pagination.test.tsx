/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeInTheDocument()

    const chevronLeft = container.querySelector('svg.lucide-chevron-left')
    expect(chevronLeft).not.toBeNull()
    expect(chevronLeft).toHaveAttribute('aria-hidden', 'true')

    const chevronRight = container.querySelector('svg.lucide-chevron-right')
    expect(chevronRight).not.toBeNull()
    expect(chevronRight).toHaveAttribute('aria-hidden', 'true')
  })
})
