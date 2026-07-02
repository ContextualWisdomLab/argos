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

    expect(screen.getByRole('group', { name: 'Date range presets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '30d' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '90d' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument()
  })

  it('navigates when preset is clicked', () => {
    render(<DateRangePicker />)

    const button30d = screen.getByRole('button', { name: '30d' })
    fireEvent.click(button30d)

    const today = new Date()
    const from = format(subDays(today, 30), 'yyyy-MM-dd')
    const to = format(today, 'yyyy-MM-dd')

    expect(mockPush).toHaveBeenCalledWith(`?from=${from}&to=${to}`)
  })
})
