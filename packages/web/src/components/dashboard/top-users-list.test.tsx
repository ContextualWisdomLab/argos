/** @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { TopUsersList } from './top-users-list'
import type { UserStat } from '@argos/shared'

describe('TopUsersList', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly with no users', () => {
    render(<TopUsersList users={[]} />)
    expect(screen.getByText('최근 7일간 활동한 사용자가 없습니다')).toBeInTheDocument()
  })

  it('renders a list of users with correct calculations', () => {
    const mockUsers: UserStat[] = [
      {
        userId: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        avatarUrl: null,
        sessionCount: 5,
        inputTokens: 1000,
        outputTokens: 500,
        agentCalls: 2,
        skillCalls: 3,
        estimatedCostUsd: 1.5,
      },
      {
        userId: 'u2',
        name: 'Bob',
        email: 'bob@example.com',
        avatarUrl: null,
        sessionCount: 2,
        inputTokens: 200,
        outputTokens: 100,
        agentCalls: 1,
        skillCalls: 1,
        estimatedCostUsd: 0.3,
      },
    ]

    render(<TopUsersList users={mockUsers} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('handles case where all maxTokens are 0', () => {
    const mockUsersZero: UserStat[] = [
      {
        userId: 'u1',
        name: 'Zero',
        email: 'zero@example.com',
        avatarUrl: null,
        sessionCount: 1,
        inputTokens: 0,
        outputTokens: 0,
        agentCalls: 0,
        skillCalls: 0,
        estimatedCostUsd: 0,
      }
    ]
    render(<TopUsersList users={mockUsersZero} />)
    expect(screen.getByText('Zero')).toBeInTheDocument()
  })
})
