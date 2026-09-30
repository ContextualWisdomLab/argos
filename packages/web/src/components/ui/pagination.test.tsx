/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it } from 'vitest'

globalThis.React = React;

import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Pagination } from './pagination'

describe('Pagination Components', () => {
  it('includes aria-hidden="true" on decorative icons and retains accessible names', () => {
    const { container } = render(<Pagination page={2} pageSize={10} total={30} onPageChange={() => {}} />)
    const prevIcon = container.querySelector('svg.lucide-chevron-left')
    expect(prevIcon).not.toBeNull()
    expect(prevIcon).toHaveAttribute('aria-hidden', 'true')
    const prevButton = prevIcon!.closest('button')
    expect(prevButton).toHaveAttribute('aria-label', '이전 페이지')

    const nextIcon = container.querySelector('svg.lucide-chevron-right')
    expect(nextIcon).not.toBeNull()
    expect(nextIcon).toHaveAttribute('aria-hidden', 'true')
    const nextButton = nextIcon!.closest('button')
    expect(nextButton).toHaveAttribute('aria-label', '다음 페이지')
  })
})
