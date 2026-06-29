import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { ContextSection } from './context-section'

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title and button', () => {
    render(<ContextSection title="Test Title">Content</ContextSection>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Test Title')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls')
  })

  it('toggles content on click', () => {
    render(<ContextSection title="Test Title">Content</ContextSection>)

    const button = screen.getByRole('button')

    // Initial state: not expanded
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Content')).toBeInTheDocument()

    // Verify aria-controls matches content id
    const controlsId = button.getAttribute('aria-controls')
    const content = screen.getByText('Content').closest('div')
    expect(content).toHaveAttribute('id', controlsId)

    // Click to collapse
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders initially open if defaultOpen is true', () => {
    render(
      <ContextSection title="Test Title" defaultOpen={true}>
        Content
      </ContextSection>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has focus-visible classes for keyboard accessibility', () => {
    render(<ContextSection title="Test Title">Content</ContextSection>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus-visible:outline-none')
    expect(button).toHaveClass('focus-visible:ring-2')
    expect(button).toHaveClass('focus-visible:ring-ring')
  })
})
