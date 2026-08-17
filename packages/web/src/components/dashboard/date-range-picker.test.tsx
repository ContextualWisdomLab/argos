/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouter, useSearchParams } from 'next/navigation'

import { DateRangePicker } from './date-range-picker'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

const TODAY = new Date(2026, 7, 17, 12, 0, 0)

const PRESET_EXPECTATIONS = [
  { name: '7d', description: 'Last 7 days', from: '2026-08-11', to: '2026-08-17' },
  { name: '30d', description: 'Last 30 days', from: '2026-07-19', to: '2026-08-17' },
  { name: '90d', description: 'Last 90 days', from: '2026-05-20', to: '2026-08-17' },
  { name: 'ALL', description: 'Last 3,650 days', from: '2016-08-20', to: '2026-08-17' },
] as const

describe('DateRangePicker', () => {
  let mockPush: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
    mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    )
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders presets with a truthful default seven-day range', () => {
    render(<DateRangePicker />)

    expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: '90d' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'ALL' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Aug 11 ~ Aug 17')).toBeInTheDocument()
  })

  it.each(PRESET_EXPECTATIONS)(
    'maps $name to the exact inclusive range advertised by its description',
    ({ name, from, to }) => {
      render(<DateRangePicker />)

      fireEvent.click(screen.getByRole('button', { name }))

      expect(mockPush).toHaveBeenCalledTimes(1)
      const calledUrl = mockPush.mock.calls[0][0] as string
      const params = new URLSearchParams(calledUrl.slice(calledUrl.indexOf('?') + 1))
      expect(params.get('from')).toBe(from)
      expect(params.get('to')).toBe(to)
      expect(params.has('page')).toBe(false)
    },
  )

  it.each(PRESET_EXPECTATIONS)(
    'recognizes the exact $name URL range as pressed',
    ({ name, from, to }) => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams({ from, to }) as unknown as ReturnType<typeof useSearchParams>,
      )

      render(<DateRangePicker />)

      for (const preset of PRESET_EXPECTATIONS) {
        expect(screen.getByRole('button', { name: preset.name })).toHaveAttribute(
          'aria-pressed',
          preset.name === name ? 'true' : 'false',
        )
      }
    },
  )

  it('names the preset group and describes abbreviations without replacing visible button names', () => {
    render(<DateRangePicker />)

    expect(screen.getByRole('group', { name: 'Date range presets' })).toBeDefined()

    for (const { name, description } of PRESET_EXPECTATIONS) {
      const button = screen.getByRole('button', { name })
      const descriptionId = button.getAttribute('aria-describedby')
      expect(descriptionId).toBeTruthy()
      expect(document.getElementById(descriptionId!)?.textContent).toBe(description)
    }
  })
})
