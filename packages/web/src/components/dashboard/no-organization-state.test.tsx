/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NoOrganizationState } from './no-organization-state';

const signOut = vi.fn();

global.React = React;

vi.mock('next-auth/react', () => ({ signOut }));
vi.mock('lucide-react', () => ({
  PlusIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="plus-icon" {...props} />
  ),
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock('@/components/copy-prompt-button', () => ({
  CopyPromptButton: ({ text }: { text: string }) => (
    <button type="button">{text}</button>
  ),
}));
vi.mock('@/components/org/create-org-modal', () => ({
  CreateOrgModal: ({ open }: { open: boolean }) => (
    <div data-testid="create-org-modal" data-open={String(open)} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NoOrganizationState accessibility boundaries', () => {
  function renderState() {
    render(
      <NoOrganizationState
        email="buyer@example.com"
        onboardPrompt="connect this workspace"
        onboardTokenExpiresAt="2026-08-14T10:00:00.000Z"
      />,
    );
  }

  it('keeps the logout control non-submitting and visibly keyboard-focusable', () => {
    renderState();

    const logoutButton = screen.getByRole('button', {
      name: 'Log out of your account',
    });

    expect(logoutButton.getAttribute('type')).toBe('button');
    expect(logoutButton.className).toContain('focus-visible:ring-2');
    expect(logoutButton.className).toContain('focus-visible:ring-ring');

    fireEvent.click(logoutButton);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  it('hides the decorative create icon while preserving the button label and action', () => {
    renderState();

    const createButton = screen.getByRole('button', { name: '조직 수동 생성' });
    const plusIcon = screen.getByTestId('plus-icon');

    expect(plusIcon.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('create-org-modal').getAttribute('data-open')).toBe(
      'false',
    );

    fireEvent.click(createButton);
    expect(screen.getByTestId('create-org-modal').getAttribute('data-open')).toBe(
      'true',
    );
  });
});
