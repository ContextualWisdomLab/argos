/** @vitest-environment jsdom */
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import OrgHomePage from './page'

global.React = React

vi.mock('next/navigation', () => ({
  useParams: () => ({ orgSlug: 'buyer-org' }),
}))
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))
vi.mock('lucide-react', () => ({
  PencilIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="pencil-icon" {...props} />,
  Trash2Icon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="trash-icon" {...props} />,
  PlusIcon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="plus-icon" {...props} />,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant: _variant, size: _size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => (
    <button {...props}>{children}</button>
  ),
}))
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}))
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}))
vi.mock('@/hooks/use-projects', () => ({
  useProjects: () => ({
    isLoading: false,
    data: {
      projects: [{ id: 'project-1', slug: 'alpha', name: 'Alpha', createdAt: '2026-08-14T00:00:00.000Z' }],
    },
  }),
}))
vi.mock('@/hooks/use-orgs', () => ({
  useOrgs: () => ({ data: { orgs: [{ slug: 'buyer-org', name: 'Buyer Org' }] } }),
}))
vi.mock('@/components/org/create-project-modal', () => ({ CreateProjectModal: () => null }))
vi.mock('@/components/org/delete-project-modal', () => ({ DeleteProjectModal: () => null }))
vi.mock('@/components/org/rename-project-modal', () => ({ RenameProjectModal: () => null }))

afterEach(cleanup)

describe('project action icon accessibility', () => {
  it('keeps every text-redundant project action icon out of the accessibility tree', () => {
    render(<OrgHomePage />)

    expect(screen.getByTestId('pencil-icon').getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByTestId('trash-icon').getAttribute('aria-hidden')).toBe('true')
    for (const icon of screen.getAllByTestId('plus-icon')) {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    }

    expect(screen.getByRole('button', { name: '프로젝트 이름 변경' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '프로젝트 삭제' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create project' })).toBeTruthy()
  })
})
