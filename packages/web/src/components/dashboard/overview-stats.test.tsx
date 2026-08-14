/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewStats } from './overview-stats'

describe('OverviewStats explanation toggle', () => {
  beforeEach(() => {
    vi.stubGlobal('React', React)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('exposes state, reveals the explanation, and rotates a hidden standard icon', () => {
    render(
      <OverviewStats
        periodLabel="Last 7 days"
        sessions={1}
        turns={2}
        inputTokens={3}
        outputTokens={4}
        cacheReadTokens={5}
        cacheCreationTokens={6}
        estimatedCostUsd={0.01}
      />,
    )

    const toggle = screen.getByRole('button', { name: /What do these numbers mean/ })
    const explanation = document.getElementById('overview-stats-explanation')
    const icon = toggle.querySelector('svg')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(explanation).toHaveAttribute('hidden')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).not.toHaveClass('rotate-90')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(explanation).not.toHaveAttribute('hidden')
    expect(icon).toHaveClass('rotate-90')
  })
})
