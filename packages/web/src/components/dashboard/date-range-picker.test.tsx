import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DateRangePicker } from './date-range-picker'

let mockSearchParams = new URLSearchParams()
const mockPush = vi.fn()

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
  }
})

describe('DateRangePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-10T12:00:00Z'))
    mockSearchParams = new URLSearchParams()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders 7d preset as active initially', () => {
    mockSearchParams = new URLSearchParams({
      from: '2025-01-04', // 6 days diff => activePreset = 7
      to: '2025-01-10'
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('7d')[0].getAttribute('aria-pressed')).toBe('true')
    unmount()
  })

  it('renders 30d preset as active', () => {
    mockSearchParams = new URLSearchParams({
      from: '2024-12-12', // 29 days diff => activePreset = 30
      to: '2025-01-10'
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('30d')[0].getAttribute('aria-pressed')).toBe('true')
    unmount()
  })

  it('renders 90d preset as active', () => {
    mockSearchParams = new URLSearchParams({
      from: '2024-10-13', // 89 days diff => activePreset = 90
      to: '2025-01-10'
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('90d')[0].getAttribute('aria-pressed')).toBe('true')
    unmount()
  })

  it('renders ALL preset as active', () => {
    mockSearchParams = new URLSearchParams({
      from: '2015-01-01', // > 3649 days diff => activePreset = 3650
      to: '2025-01-10'
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('ALL')[0].getAttribute('aria-pressed')).toBe('true')
    unmount()
  })

  it('renders no preset as active if date range is custom', () => {
    mockSearchParams = new URLSearchParams({
      from: '2025-01-08', // 2 days diff
      to: '2025-01-10'
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('7d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('30d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('90d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('ALL')[0].getAttribute('aria-pressed')).toBe('false')
    unmount()
  })

  it('renders no preset as active if today is not today', () => {
    mockSearchParams = new URLSearchParams({
      from: '2025-01-03',
      to: '2025-01-09' // not today
    })

    const { unmount } = render(<DateRangePicker />)
    expect(screen.getAllByText('7d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('30d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('90d')[0].getAttribute('aria-pressed')).toBe('false')
    expect(screen.getAllByText('ALL')[0].getAttribute('aria-pressed')).toBe('false')
    unmount()
  })

  it('updates url on preset click', () => {
    render(<DateRangePicker />)

    const btn30d = screen.getAllByText('30d')[0]
    fireEvent.click(btn30d)

    expect(mockPush).toHaveBeenCalled()
  })
})
