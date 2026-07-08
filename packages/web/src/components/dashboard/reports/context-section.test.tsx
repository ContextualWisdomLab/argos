import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import { ContextSection } from './context-section'

/** @vitest-environment jsdom */

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly and toggles content visibility', async () => {
    const user = userEvent.setup()
    render(
      <ContextSection title="Test Title">
        <p>Hidden Content</p>
      </ContextSection>
    )

    // Initially collapsed
    const button = screen.getByRole('button', { name: /Test Title/i })
    expect(button).toBeDefined()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Hidden Content')).toBeNull()

    // Click to expand
    await user.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')

    const content = screen.getByText('Hidden Content')
    expect(content).toBeDefined()

    // Verify accessibility attributes are linked correctly
    const contentId = content.parentElement?.getAttribute('id')
    expect(button.getAttribute('aria-controls')).toBe(contentId)

    // Click to collapse
    await user.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Hidden Content')).toBeNull()
  })

  it('renders defaultOpen correctly', () => {
    render(
      <ContextSection title="Open Title" defaultOpen>
        <p>Visible Content</p>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /Open Title/i })
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Visible Content')).toBeDefined()
  })
})
