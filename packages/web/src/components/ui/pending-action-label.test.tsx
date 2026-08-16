/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { describe, expect, it } from 'vitest'

import { PendingActionLabel } from './pending-action-label'

expect.extend(matchers)

describe('PendingActionLabel', () => {
  it('renders the idle action without a decorative spinner', () => {
    const { container } = render(
      <button type="button">
        <PendingActionLabel
          pending={false}
          idleLabel="생성"
          pendingLabel="생성 중…"
        />
      </button>
    )

    expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('preserves the pending accessible name and hides motion-only decoration', () => {
    const { container } = render(
      <button type="button" aria-busy="true" disabled>
        <PendingActionLabel
          pending
          idleLabel="생성"
          pendingLabel="생성 중…"
        />
      </button>
    )

    const button = screen.getByRole('button', { name: '생성 중…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    const spinner = container.querySelector('svg')
    expect(spinner).toHaveClass('animate-spin', 'motion-reduce:animate-none')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(spinner).toHaveAttribute('focusable', 'false')
  })

  it.each([
    ['저장', '저장 중…'],
    ['변경', '변경 중…'],
    ['이동', '이동 중…'],
    ['추가', '추가 중…'],
    ['제거', '제거 중…'],
    ['삭제', '삭제 중…'],
  ] as const)(
    '%s 대기 라벨을 버튼의 접근 가능한 이름으로 유지한다',
    (idleLabel, pendingLabel) => {
      render(
        <button type="button" aria-busy="true" disabled>
          <PendingActionLabel pending idleLabel={idleLabel} pendingLabel={pendingLabel} />
        </button>
      )

      expect(screen.getByRole('button', { name: pendingLabel })).toBeDisabled()
    }
  )
})
