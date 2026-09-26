/** @vitest-environment jsdom */

import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pagination } from './pagination'

describe('Pagination accessibility', () => {
  afterEach(cleanup)

  /**
   * Keeps chevrons decorative while the controls retain their exact accessible
   * names and page-change behavior.
   */
  it('hides navigation icons without hiding labeled actions', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination
        page={2}
        pageSize={10}
        total={30}
        onPageChange={onPageChange}
      />,
    )

    const previous = screen.getByRole('button', { name: '이전 페이지' })
    const next = screen.getByRole('button', { name: '다음 페이지' })

    expect(previous.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(next.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    await user.click(next)
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
