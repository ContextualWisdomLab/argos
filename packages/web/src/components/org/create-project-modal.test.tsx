/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { describe, expect, it, vi } from 'vitest'

import { CreateProjectModal } from './create-project-modal'
import { useCreateProject } from '@/hooks/use-create-project'

expect.extend(matchers)
global.React = React

const mockMutate = vi.fn()
const mockReset = vi.fn()

vi.mock('@/hooks/use-create-project', () => ({
  useCreateProject: vi.fn(() => ({
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

describe('CreateProjectModal pending feedback', () => {
  it('renders modal when open', () => {
    vi.mocked(useCreateProject).mockReturnValueOnce({
      mutate: mockMutate,
      reset: mockReset,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateProject>)

    render(<CreateProjectModal orgSlug="test-org" open={true} onOpenChange={() => {}} />)

    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
    expect(screen.getByText('새 프로젝트 만들기')).toBeInTheDocument()
  })

  it('shows a decorative spinner and disabled submit button while pending', () => {
    vi.mocked(useCreateProject).mockReturnValueOnce({
      mutate: mockMutate,
      reset: mockReset,
      isPending: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateProject>)

    render(<CreateProjectModal orgSlug="test-org" open={true} onOpenChange={() => {}} />)

    const submitButton = screen.getByRole('button', { name: /생성 중…/i })
    expect(submitButton).toBeDisabled()

    const spinner = submitButton.querySelector('svg')
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })
})
