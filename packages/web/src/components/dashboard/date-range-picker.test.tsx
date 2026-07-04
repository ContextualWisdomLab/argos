import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateRangePicker } from './date-range-picker'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('DateRangePicker', () => {
  it('renders presets correctly and handles click', () => {
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams())

    render(<DateRangePicker />)

    const button7d = screen.getByRole('button', { name: '7d' })
    const button30d = screen.getByRole('button', { name: '30d' })

    expect(button7d).toBeDefined()
    expect(button30d).toBeDefined()

    // Default is 7 days, check aria-pressed
    expect(button7d.getAttribute('aria-pressed')).toBe('true')
    expect(button30d.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(button30d)

    const today = new Date()
    const from = format(subDays(today, 30), 'yyyy-MM-dd')
    const to = format(today, 'yyyy-MM-dd')

    expect(mockPush).toHaveBeenCalledWith(`?from=${from}&to=${to}`)
  })

  it('identifies custom date range', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('?from=2023-01-01&to=2023-01-10'))

    render(<DateRangePicker />)

    const button7d = screen.getByRole('button', { name: '7d' })
    const button30d = screen.getByRole('button', { name: '30d' })

    expect(button7d.getAttribute('aria-pressed')).toBe('false')
    expect(button30d.getAttribute('aria-pressed')).toBe('false')
  })
})
