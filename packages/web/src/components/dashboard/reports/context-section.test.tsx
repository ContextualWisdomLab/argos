/** @vitest-environment jsdom */
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { ContextSection } from './context-section'

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps the visible section title as the disclosure name while aria-expanded exposes state', async () => {
    const user = userEvent.setup()
    render(
      <ContextSection title="Test Title">
        <div data-testid="test-content">Content</div>
      </ContextSection>
    )

    const toggle = screen.getByRole('button', { name: 'Test Title' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Test Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    const region = screen.getByRole('region', { name: 'Test Title' })
    expect(region).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Test Title' }))
    expect(screen.getByRole('button', { name: 'Test Title' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()
  })

  it('keeps the region name stable when open by default', () => {
    render(
      <ContextSection title="Test Title" defaultOpen>
        <div data-testid="test-content">Content</div>
      </ContextSection>
    )

    expect(screen.getByRole('button', { name: 'Test Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Test Title' })).toBeInTheDocument()
  })
})
