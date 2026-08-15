/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { OverviewStats } from './overview-stats'

describe('OverviewStats', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultProps = {
    periodLabel: 'Last 7 days',
    sessions: 1234,
    turns: 5678,
    inputTokens: 1000000,
    outputTokens: 500000,
    cacheReadTokens: 2000000,
    cacheCreationTokens: 100000,
    estimatedCostUsd: 12.34,
  }

  it('renders all stats correctly', () => {
    render(<OverviewStats {...defaultProps} />)

    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('5,678')).toBeInTheDocument()
    expect(screen.getByText('$12.34')).toBeInTheDocument()
    // Test the formatting of large numbers
    expect(screen.getByText('1.0M')).toBeInTheDocument()
    expect(screen.getByText('500.0K')).toBeInTheDocument()
    expect(screen.getByText('2.0M')).toBeInTheDocument()
    expect(screen.getByText('100.0K')).toBeInTheDocument()
  })

  it('renders rangeSelector when provided', () => {
    render(
      <OverviewStats
        {...defaultProps}
        rangeSelector={<div data-testid="range-selector">Range Selector</div>}
      />
    )
    expect(screen.getByTestId('range-selector')).toBeInTheDocument()
  })

  it('toggles explanation container visibility and updates aria attributes', () => {
    render(<OverviewStats {...defaultProps} />)

    const toggleButton = screen.getByRole('button', { name: /What do these numbers mean/i })

    // Initially closed
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

    // Explanation container should be correctly linked
    const controlsId = toggleButton.getAttribute('aria-controls')
    expect(controlsId).not.toBeNull()
    const explanationContainer = document.getElementById(controlsId as string)
    expect(explanationContainer).toBeInTheDocument()
    expect(explanationContainer).toHaveAttribute('role', 'region')
    expect(explanationContainer).toHaveAttribute('hidden')
    expect(explanationContainer).toHaveAttribute('aria-labelledby', toggleButton.id)

    // Click to open
    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    expect(explanationContainer).not.toHaveAttribute('hidden')

    // Check that explanation text is visible
    expect(screen.getByText(/팀원들이 시작한 Claude Code 세션 수/i)).toBeInTheDocument()

    // Click to close
    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    expect(explanationContainer).toHaveAttribute('hidden')
  })
})
