import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import React from 'react'; globalThis.React = React;
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrgHeader } from './org-header'
/**
 * @vitest-environment jsdom
 */
afterEach(() => { cleanup(); });

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}))

// Mock ProjectFilter as it's not the subject under test
vi.mock('./project-filter', () => ({
  ProjectFilter: () => <div data-testid="project-filter" />,
}))

describe('OrgHeader', () => {
  it('renders default title when orgName is not provided', () => {
    render(<OrgHeader />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders orgName when provided', () => {
    render(<OrgHeader orgName="Test Org" />)
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })

  it('renders ProjectFilter component', () => {
    render(<OrgHeader />)
    expect(screen.getByTestId('project-filter')).toBeInTheDocument()
  })

  it('renders sign out button with LogOut icon', () => {
    render(<OrgHeader />)
    const buttons = screen.getAllByRole('button', { name: 'Sign out of your account' })
    const button = buttons[0]
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Sign out')

    // Check if SVG icon is present and has aria-hidden
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
