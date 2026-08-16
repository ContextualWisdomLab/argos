/** @vitest-environment jsdom */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SessionDeleteButton } from './session-delete-button'

describe('SessionDeleteButton', () => {
  it('names the icon-only action with the visible session title and hides the decorative icon', () => {
    const onDelete = vi.fn()
    render(<SessionDeleteButton sessionTitle="Fix login flow" onDelete={onDelete} />)

    const button = screen.getByRole('button', { name: '세션 삭제: Fix login flow' })
    expect(button.getAttribute('title')).toBe('세션 삭제: Fix login flow')
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')

    fireEvent.click(button)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('keeps a concise fallback name when the session has no useful title', () => {
    render(<SessionDeleteButton sessionTitle="   " onDelete={() => undefined} />)

    expect(screen.getByRole('button', { name: '세션 삭제' })).toBeDefined()
  })
})
