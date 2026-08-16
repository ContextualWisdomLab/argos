/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { describe, expect, it, vi } from 'vitest'

import { RenameProjectModal } from './rename-project-modal'
import { useUpdateProject } from '@/hooks/use-update-project'

expect.extend(matchers)
global.React = React

const mockMutate = vi.fn()
const mockReset = vi.fn()

vi.mock('@/hooks/use-update-project', () => ({
  useUpdateProject: vi.fn(() => ({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isError: false,
    error: null,
  })),
}))

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('RenameProjectModal pending feedback', () => {
  it('프로젝트 이름 변경 대화상자를 연다', () => {
    vi.mocked(useUpdateProject).mockReturnValue({
      mutate: mockMutate,
      reset: mockReset,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateProject>)

    render(
      <RenameProjectModal
        project={{ id: 'proj_argos_web', name: 'argos-web' }}
        onClose={() => {}}
      />
    )

    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
    expect(screen.getByText('프로젝트 이름 변경')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '변경' })).toBeInTheDocument()
  })

  it('이름 변경이 진행 중이면 바쁜 상태와 장식용 스피너를 보여준다', () => {
    vi.mocked(useUpdateProject).mockReturnValue({
      mutate: mockMutate,
      reset: mockReset,
      isPending: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateProject>)

    render(
      <RenameProjectModal
        project={{ id: 'proj_argos_web', name: 'argos-web' }}
        onClose={() => {}}
      />
    )

    const submitButton = screen.getByRole('button', { name: /변경 중…/i })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')

    const spinner = submitButton.querySelector('svg')
    expect(spinner).toHaveClass('animate-spin', 'motion-reduce:animate-none')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(spinner).toHaveAttribute('focusable', 'false')
  })
})
