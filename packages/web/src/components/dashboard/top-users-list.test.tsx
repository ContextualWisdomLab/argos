/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopUsersList } from './top-users-list'

describe('TopUsersList', () => {
  it('renders correctly with empty users list', () => {
    render(<TopUsersList users={[]} />)
    expect(screen.getByText('최근 7일간 활동한 사용자가 없습니다')).toBeDefined()
  })

  it('renders correctly with users data', () => {
    const mockUsers = [
      {
        userId: '1',
        name: 'User 1',
        inputTokens: 100,
        outputTokens: 200,
        sessionCount: 5,
        estimatedCostUsd: 0.1,
      },
      {
        userId: '2',
        name: 'User 2',
        inputTokens: 500,
        outputTokens: 1000,
        sessionCount: 15,
        estimatedCostUsd: 0.5,
      },
    ]
    render(<TopUsersList users={mockUsers} />)
    expect(screen.getByText('User 1')).toBeDefined()
    expect(screen.getByText('User 2')).toBeDefined()
  })
})
