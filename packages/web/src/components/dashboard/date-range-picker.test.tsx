import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { DateRangePicker } from './date-range-picker'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('DateRangePicker', () => {
  const TODAY = new Date('2024-07-04T00:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders presets correctly and handles click', () => {
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof vi.fn>)
    const from = format(subDays(TODAY, 6), 'yyyy-MM-dd')
    const to = format(TODAY, 'yyyy-MM-dd')
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(`?from=${from}&to=${to}`))

    render(<DateRangePicker />)

    const button7d = screen.getByRole('button', { name: '7d' })
    const button30d = screen.getByRole('button', { name: '30d' })
    const button90d = screen.getByRole('button', { name: '90d' })
    const buttonAll = screen.getByRole('button', { name: 'ALL' })

    expect(button7d).toBeDefined()
    expect(button30d).toBeDefined()

    // Default is 7 days, check aria-pressed
    expect(button7d.getAttribute('aria-pressed')).toBe('true')
    expect(button30d.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(button30d)

    const from30 = format(subDays(TODAY, 30), 'yyyy-MM-dd')
    const to30 = format(TODAY, 'yyyy-MM-dd')

    expect(mockPush).toHaveBeenCalledWith(`?from=${from30}&to=${to30}`)

    // 90d click
    fireEvent.click(button90d)
    const from90 = format(subDays(TODAY, 90), 'yyyy-MM-dd')
    const to90 = format(TODAY, 'yyyy-MM-dd')
    expect(mockPush).toHaveBeenCalledWith(`?from=${from90}&to=${to90}`)

    // ALL click
    fireEvent.click(buttonAll)
    const fromAll = format(subDays(TODAY, 3650), 'yyyy-MM-dd')
    const toAll = format(TODAY, 'yyyy-MM-dd')
    expect(mockPush).toHaveBeenCalledWith(`?from=${fromAll}&to=${toAll}`)

  })

  it('identifies custom date range', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('?from=2023-01-01&to=2023-01-10'))

    render(<DateRangePicker />)

    const button7d = screen.getByRole('button', { name: '7d' })
    const button30d = screen.getByRole('button', { name: '30d' })

    expect(button7d.getAttribute('aria-pressed')).toBe('false')
    expect(button30d.getAttribute('aria-pressed')).toBe('false')
  })

  it('identifies 30d preset correctly from url', () => {
    const from = format(subDays(TODAY, 29), 'yyyy-MM-dd')
    const to = format(TODAY, 'yyyy-MM-dd')

    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(`?from=${from}&to=${to}`))

    render(<DateRangePicker />)

    const button30d = screen.getByRole('button', { name: '30d' })
    expect(button30d.getAttribute('aria-pressed')).toBe('true')
  })

  it('identifies 90d preset correctly from url', () => {
    const from = format(subDays(TODAY, 89), 'yyyy-MM-dd')
    const to = format(TODAY, 'yyyy-MM-dd')

    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(`?from=${from}&to=${to}`))

    render(<DateRangePicker />)

    const button90d = screen.getByRole('button', { name: '90d' })
    expect(button90d.getAttribute('aria-pressed')).toBe('true')
  })

  it('identifies ALL preset correctly from url', () => {
    const from = format(subDays(TODAY, 3649), 'yyyy-MM-dd')
    const to = format(TODAY, 'yyyy-MM-dd')

    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(`?from=${from}&to=${to}`))

    render(<DateRangePicker />)

    const buttonAll = screen.getByRole('button', { name: 'ALL' })
    expect(buttonAll.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('DateRangePicker default params coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-04T00:00:00Z'))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('covers daysDiff logic when isToday=false', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('?from=2024-07-01&to=2024-07-02'))
    render(<DateRangePicker />)
    const button7d = screen.getByRole('button', { name: '7d' })
    expect(button7d.getAttribute('aria-pressed')).toBe('false')
  })

  it('covers currentTo null', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<typeof vi.fn>)
    const p = new URLSearchParams()
    p.set('from', '2024-07-01')
    vi.mocked(useSearchParams).mockReturnValue(p)
    render(<DateRangePicker />)
    const button7d = screen.getByRole('button', { name: '7d' })
    expect(button7d.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('DateRangePicker default params coverage edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-04T00:00:00Z'))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('covers daysDiff no match', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('?from=2024-07-03&to=2024-07-04'))
    render(<DateRangePicker />)
    const button7d = screen.getByRole('button', { name: '7d' })
    expect(button7d.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('DateRangePicker params from null', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-04T00:00:00Z'))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('covers currentFrom null', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as ReturnType<typeof vi.fn>)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('?to=2024-07-04'))
    render(<DateRangePicker />)
    const button7d = screen.getByRole('button', { name: '7d' })
    expect(button7d.getAttribute('aria-pressed')).toBe('false')
  })
})
