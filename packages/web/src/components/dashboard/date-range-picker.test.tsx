import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DateRangePicker } from './date-range-picker'
import { subDays, format } from 'date-fns'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('DateRangePicker', () => {
  it('renders presets correctly', () => {
    render(<DateRangePicker />)

    // Select all elements matching the role and take the first one
    const groups = screen.getAllByRole('group', { name: 'Date range presets' })
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0]).toBeInTheDocument()

    const button7d = screen.getAllByRole('button', { name: '7d' })
    expect(button7d.length).toBeGreaterThan(0)
    expect(button7d[0]).toBeInTheDocument()
  })

  it('navigates when preset is clicked', () => {
    render(<DateRangePicker />)

    // Select all 30d buttons and click the first one
    const button30d = screen.getAllByRole('button', { name: '30d' })
    expect(button30d.length).toBeGreaterThan(0)
    fireEvent.click(button30d[0])

    const today = new Date()
    const from = format(subDays(today, 30), 'yyyy-MM-dd')
    const to = format(today, 'yyyy-MM-dd')

    expect(mockPush).toHaveBeenCalledWith(`?from=${from}&to=${to}`)
  })
})
