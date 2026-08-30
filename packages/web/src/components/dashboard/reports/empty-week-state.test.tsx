/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { EmptyWeekState } from './empty-week-state'

// Setup React globally
global.React = React;

describe('EmptyWeekState', () => {
  it('renders correctly with default title', () => {
    render(<EmptyWeekState message="Test message" />)

    expect(screen.getByText('데이터 없음')).toBeDefined()
    expect(screen.getByText('Test message')).toBeDefined()
  })

  it('renders correctly with custom title and message', () => {
    render(
      <EmptyWeekState
        title="Custom Title"
        message="Custom Message"
      />
    )

    expect(screen.getByText('Custom Title')).toBeDefined()
    expect(screen.getByText('Custom Message')).toBeDefined()
  })

  it('renders correctly with action', () => {
    render(
      <EmptyWeekState
        message="Test message"
        action={<button type="button">Test Action</button>}
      />
    )

    expect(screen.getByRole('button', { name: 'Test Action' })).toBeDefined()
  })

  it('reserves vertical space for centered empty-state content', () => {
    const { container } = render(<EmptyWeekState message="Test message" />)

    expect(container.firstElementChild).toHaveClass('min-h-64')
  })
})