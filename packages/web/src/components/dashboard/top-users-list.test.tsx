/** @vitest-environment jsdom */
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { TopUsersList } from './top-users-list'
import type { UserStat } from '@argos/shared'

vi.mock('@/lib/format', () => ({
  formatTokens: (v: number) => `T${v}`,
  formatCost: (v: number) => `$${v}`,
}))

afterEach(() => {
  cleanup()
})

describe('TopUsersList', () => {
  it('renders correctly with no users', () => {
    render(<TopUsersList users={[]} />)
    expect(screen.getByText('최근 7일간 활동한 사용자가 없습니다')).toBeDefined()
  })

  it('renders correctly when maxTokens is zero', () => {
    const users: UserStat[] = [
      {
        userId: 'u3',
        name: 'Charlie',
        inputTokens: 0,
        outputTokens: 0,
        sessionCount: 0,
        estimatedCostUsd: 0,
        agentCalls: 0,
        skillCalls: 0,
      }
    ]

    const { container } = render(<TopUsersList users={users} />)
    expect(screen.getByText('Charlie')).toBeDefined()
    expect(screen.getByText('T0')).toBeDefined()
    expect(
      (container.querySelector('.bg-brand') as HTMLElement).style.width
    ).toBe('0%')
  })

  it('renders list of users correctly', () => {
    const users: UserStat[] = [
      {
        userId: 'u1',
        name: 'Alice',
        inputTokens: 100,
        outputTokens: 200,
        sessionCount: 5,
        estimatedCostUsd: 1.5,
        agentCalls: 0,
        skillCalls: 0,
      },
      {
        userId: 'u2',
        name: 'Bob',
        inputTokens: 50,
        outputTokens: 50,
        sessionCount: 2,
        estimatedCostUsd: 0.5,
        agentCalls: 0,
        skillCalls: 0,
      },
      {
        userId: 'u3',
        name: 'Charlie',
        inputTokens: 0,
        outputTokens: 0,
        sessionCount: 0,
        estimatedCostUsd: 0,
        agentCalls: 0,
        skillCalls: 0,
      }
    ]

    const { container } = render(<TopUsersList users={users} />)

    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('T300')).toBeDefined()
    expect(screen.getByText('5 sessions')).toBeDefined()
    expect(screen.getByText('$1.5')).toBeDefined()

    expect(screen.getByText('Bob')).toBeDefined()
    expect(screen.getByText('T100')).toBeDefined()
    expect(screen.getByText('2 sessions')).toBeDefined()
    expect(screen.getByText('$0.5')).toBeDefined()

    const bars = container.querySelectorAll<HTMLElement>('.bg-brand')
    expect(bars).toHaveLength(3)
    expect(bars[0].style.width).toBe('100%')
    expect(parseFloat(bars[1].style.width)).toBeCloseTo(100 / 3)
    expect(bars[2].style.width).toBe('0%')
  })
})
