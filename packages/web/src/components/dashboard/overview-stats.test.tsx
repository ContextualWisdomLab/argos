/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { OverviewStats } from './overview-stats'

const props = {
  periodLabel: 'Last 7 days',
  sessions: 2,
  turns: 5,
  inputTokens: 1_000,
  outputTokens: 500,
  cacheReadTokens: 250,
  cacheCreationTokens: 100,
  estimatedCostUsd: 1.25,
}

describe('OverviewStats disclosure accessibility', () => {
  afterEach(cleanup)

  it('creates unique and correctly linked disclosure relationships per instance', () => {
    render(
      <>
        <OverviewStats {...props} />
        <OverviewStats {...props} />
      </>
    )

    const buttons = screen.getAllByRole('button', {
      name: /What do these numbers mean\?/,
    })
    const regions = screen.getAllByRole('region', { hidden: true })

    expect(buttons).toHaveLength(2)
    expect(regions).toHaveLength(2)
    const ids = [...buttons, ...regions].map(element => element.id)
    expect(ids.every(id => id.length > 0)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)

    buttons.forEach((button, index) => {
      const region = regions[index]!
      expect(button.getAttribute('aria-controls')).toBe(region.id)
      expect(region.getAttribute('aria-labelledby')).toBe(button.id)
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(region.hidden).toBe(true)
    })

    fireEvent.click(buttons[0]!)

    expect(buttons[0]!.getAttribute('aria-expanded')).toBe('true')
    expect(regions[0]!.hidden).toBe(false)
    expect(buttons[1]!.getAttribute('aria-expanded')).toBe('false')
    expect(regions[1]!.hidden).toBe(true)
  })
})
