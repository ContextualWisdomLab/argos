import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { ContextSection } from './context-section'

/** @vitest-environment jsdom */

describe('ContextSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title correctly', () => {
    render(
      <ContextSection title="Test Title">
        <p>Test Content</p>
      </ContextSection>
    )
    expect(screen.getByText('Test Title')).toBeDefined()
  })

  it('toggles content visibility on click', () => {
    render(
      <ContextSection title="Test Title">
        <div data-testid="content">Test Content</div>
      </ContextSection>
    )

    // Initially closed
    expect(screen.queryByTestId('content')).toBeNull()
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-expanded')).toBe('false')

    // Click to open
    fireEvent.click(button)
    expect(screen.getByTestId('content')).toBeDefined()
    expect(button.getAttribute('aria-expanded')).toBe('true')

    // Click to close
    fireEvent.click(button)
    expect(screen.queryByTestId('content')).toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('respects defaultOpen prop', () => {
    render(
      <ContextSection title="Test Title" defaultOpen={true}>
        <div data-testid="content">Test Content</div>
      </ContextSection>
    )

    expect(screen.getByTestId('content')).toBeDefined()
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-expanded')).toBe('true')
  })

  it('has correct ARIA attributes for accessibility', () => {
    render(
      <ContextSection title="Test Title" defaultOpen={true}>
        <div data-testid="content">Test Content</div>
      </ContextSection>
    )

    const button = screen.getByRole('button')
    const region = screen.getByRole('region')

    const buttonControls = button.getAttribute('aria-controls')
    const regionId = region.getAttribute('id')
    const regionLabelledBy = region.getAttribute('aria-labelledby')
    const buttonId = button.getAttribute('id')

    expect(buttonControls).toBeTruthy()
    expect(regionId).toBeTruthy()
    expect(buttonControls).toBe(regionId)

    expect(regionLabelledBy).toBeTruthy()
    expect(buttonId).toBeTruthy()
    expect(regionLabelledBy).toBe(buttonId)
  })
})
