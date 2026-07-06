/** @vitest-environment jsdom */
import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { describe, it, expect, afterEach } from 'vitest'
import { ContextSection } from './context-section'

expect.extend(matchers)

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title and children correctly', () => {
    render(
      <ContextSection title="Test Title">
        <div data-testid="child">Child Content</div>
      </ContextSection>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument() // default closed
  })

  it('renders open by default if defaultOpen is true', () => {
    render(
      <ContextSection title="Test Title" defaultOpen={true}>
        <div data-testid="child">Child Content</div>
      </ContextSection>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('toggles open/close on click', () => {
    render(
      <ContextSection title="Test Title">
        <div data-testid="child">Child Content</div>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /Test Title/i })

    // Open
    fireEvent.click(button)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Close
    fireEvent.click(button)
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('has correct ARIA attributes for accessibility', () => {
    render(
      <ContextSection title="Accessible Title" defaultOpen={true}>
        <div data-testid="child">Child Content</div>
      </ContextSection>
    )

    const button = screen.getByRole('button', { name: /Accessible Title/i })
    const region = screen.getByRole('region')

    const buttonControls = button.getAttribute('aria-controls')
    const regionId = region.getAttribute('id')
    expect(buttonControls).toBe(regionId)

    const regionLabelledBy = region.getAttribute('aria-labelledby')
    const buttonId = button.getAttribute('id')
    expect(regionLabelledBy).toBe(buttonId)
  })
})
