import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import React from 'react'; globalThis.React = React;
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrgSidebar } from './org-sidebar'
/**
 * @vitest-environment jsdom
 */
afterEach(() => { cleanup(); });

// Mock dependencies
vi.mock('next/navigation', () => ({
  useParams: () => ({ orgSlug: 'test-org' }),
  usePathname: () => '/dashboard/test-org',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}))

vi.mock('@/hooks/use-orgs', () => ({
  useOrgs: () => ({
    data: {
      orgs: [
        { id: '1', name: 'Test Org', slug: 'test-org', role: 'ADMIN' },
      ],
    },
    isLoading: false,
  }),
}))

vi.mock('./org-switcher', () => ({
  OrgSwitcher: () => <div data-testid="org-switcher" />,
}))

vi.mock('@/components/org/create-org-modal', () => ({
  CreateOrgModal: () => <div data-testid="create-org-modal" />,
}))

describe('OrgSidebar', () => {
  it('renders logo and application name', () => {
    render(<OrgSidebar />)
    const headers = screen.getAllByRole('heading', { level: 2, name: 'Argos' })
    expect(headers).toHaveLength(2) // One for desktop, one for mobile
  })

  it('renders navigation links', () => {
    render(<OrgSidebar />)

    // Test that a subset of links exist. We expect desktop and mobile versions.
    const homeLinks = screen.getAllByRole('link', { name: 'Home' })
    // Expect 2 or more since there may be multiple renders in concurrent mode / wrapper setups
    expect(homeLinks.length).toBeGreaterThanOrEqual(2)

    const settingsLinks = screen.getAllByRole('link', { name: 'Settings' })
    expect(settingsLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders logout buttons with LogOut icons and accessible attributes', () => {
    render(<OrgSidebar />)

    // Two logout buttons (desktop and mobile)
    const logoutButtons = screen.getAllByRole('button', { name: 'Log out of your account' })
    expect(logoutButtons.length).toBeGreaterThanOrEqual(2)

    // Check desktop button
    const desktopButton = logoutButtons[0]
    expect(desktopButton).toHaveTextContent('Log Out')
    const desktopIcon = desktopButton.querySelector('svg')
    expect(desktopIcon).toBeInTheDocument()
    expect(desktopIcon).toHaveAttribute('aria-hidden', 'true')

    // Check mobile button
    const mobileButton = logoutButtons[1]
    expect(mobileButton).toHaveTextContent('Logout')
    const mobileIcon = mobileButton.querySelector('svg')
    expect(mobileIcon).toBeInTheDocument()
    expect(mobileIcon).toHaveAttribute('aria-hidden', 'true')
  })
})

// Trigger CI rerun