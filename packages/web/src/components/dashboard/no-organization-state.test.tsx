/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NoOrganizationState } from './no-organization-state';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  push: vi.fn(),
  reset: vi.fn(),
  mutateAsync: vi.fn(),
}));

global.React = React;

vi.mock('next-auth/react', () => ({ signOut: mocks.signOut }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('@/hooks/use-create-org', () => ({
  useCreateOrg: () => ({
    isPending: false,
    reset: mocks.reset,
    mutateAsync: mocks.mutateAsync,
  }),
}));
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
    expect(mocks.signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  it('hides the decorative create icon while opening the real organization dialog', () => {
    renderState();

    const createButton = screen.getByRole('button', { name: '조직 수동 생성' });
    const plusIcon = screen.getByTestId('plus-icon');

    expect(plusIcon.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('alertdialog')).toBeNull();

    fireEvent.click(createButton);

    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText('새 조직 만들기')).toBeTruthy();
    expect(screen.getByLabelText('조직 이름')).toBeTruthy();
  });
});
