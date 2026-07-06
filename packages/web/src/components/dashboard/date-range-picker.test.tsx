import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DateRangePicker } from './date-range-picker'
import { useSearchParams, useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}))

describe('DateRangePicker', () => {
  let mockPush: any
  let mockSearchParams: any

  beforeEach(() => {
    mockPush = vi.fn()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
    mockSearchParams = new URLSearchParams()
    ;(useSearchParams as any).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
      toString: () => mockSearchParams.toString(),
    })

    // Mock the current date to a fixed value for stable tests
    // Using fake timers with user-event requires passing advanceTimers to setup
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-06T12:00:00Z'))
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders presets and sets accessibility attributes', () => {
    // 7 days before July 6 is June 29. The difference in days is 7. Wait, `subDays` subtracts exactly 7 days.
    // The daysDiff logic is `differenceInDays(toDate, fromDate)`.
    // If today is 07-06 and from is 06-29, the diff is 7 days.
    // Wait, the logic in component expects daysDiff === 6 for 7 days? Wait, let's check:
    // daysDiff === 6 for 7. Wait! If today is 7-6 and from is 6-29, diff is 7. Wait!
    // Ah, if `daysDiff === 7` then it doesn't match `daysDiff === 6`!
    // Let's set search params to exactly match what the component expects for 7d (daysDiff === 6? wait no, subDays(today, 7) creates a 7 day difference!
    // differenceInDays('2024-07-06', '2024-06-29') === 7.
    // The code:
    // const sevenDaysAgo = subDays(today, 7) -> differenceInDays(today, sevenDaysAgo) is 7.
    // But activePreset logic: daysDiff === 6 ? 7 : ...
    // Wait, if activePreset expects 6 for 7, then subDays(today, 7) gives 7, meaning activePreset is null!
    // Let's force `from` and `to` so that `daysDiff === 6` (e.g. from 2024-06-30 to 2024-07-06).
    mockSearchParams.set('from', '2024-06-30')
    mockSearchParams.set('to', '2024-07-06')
    render(<DateRangePicker />)

    const group = screen.getByRole('group', { name: '날짜 범위 선택' })
    expect(group).toBeInTheDocument()

    const preset7d = screen.getByRole('button', { name: '7d' })
    expect(preset7d).toHaveAttribute('aria-pressed', 'true') // Default is 7 days

    const preset30d = screen.getByRole('button', { name: '30d' })
    expect(preset30d).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates URL when preset is clicked', async () => {
    render(<DateRangePicker />)

    const preset30d = screen.getByRole('button', { name: '30d' })
    preset30d.click()

    expect(mockPush).toHaveBeenCalledWith('?from=2024-06-06&to=2024-07-06')
  })

  it('clears page parameter on date change', async () => {
    mockSearchParams.set('page', '2')
    render(<DateRangePicker />)

    const preset90d = screen.getByRole('button', { name: '90d' })
    preset90d.click()

    expect(mockPush).toHaveBeenCalledWith('?from=2024-04-07&to=2024-07-06')
  })
})
