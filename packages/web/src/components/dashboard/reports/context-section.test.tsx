/** @vitest-environment jsdom */
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, afterEach } from 'vitest'
import { ContextSection } from './context-section'

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title and can be toggled', async () => {
    const user = userEvent.setup()
    render(
      <ContextSection title="Test Title">
        <p>Test Content</p>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /Test Title/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()

    // Open
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Check region
    const region = screen.getByRole('region')
    expect(region).toBeInTheDocument()
    expect(region).toHaveTextContent('Test Content')

    // Close
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('renders open by default if defaultOpen is true', () => {
    render(
      <ContextSection title="Open Title" defaultOpen={true}>
        <p>Visible Content</p>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /Open Title/i })
    expect(button).toHaveAttribute('aria-expanded', 'true')

    const region = screen.getByRole('region')
    expect(region).toBeInTheDocument()
    expect(region).toHaveTextContent('Visible Content')
  })

  it('has required accessibility attributes linking button and content', async () => {
    const user = userEvent.setup()
    render(
      <ContextSection title="A11y Title">
        <p>A11y Content</p>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /A11y Title/i })

    // Check aria-controls attribute presence (can't fully test linkage when closed as region is removed, but we can verify the attribute exists)
    expect(button).toHaveAttribute('aria-controls')

    await user.click(button)

    const region = screen.getByRole('region')
    const buttonId = button.getAttribute('id')
    const regionId = region.getAttribute('id')

    expect(button).toHaveAttribute('aria-controls', regionId)
    expect(region).toHaveAttribute('aria-labelledby', buttonId)
  })
})
