/** @vitest-environment jsdom */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { WeekNavigator } from './week-navigator';


vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('WeekNavigator accessibility', () => {
  it('builds labeled previous and next week links with decorative icons', () => {
    render(
      <WeekNavigator currentIsoKey="2026-W16" label="2026-W16" isCurrent={true} />
    );

    const prevLink = screen.getByRole('link', { name: '이전 주' });
    expect(prevLink).toBeInTheDocument();
    const prevIcon = prevLink.querySelector('svg');
    expect(prevIcon).toHaveAttribute('aria-hidden', 'true');

    const nextLink = screen.getByRole('link', { name: '다음 주' });
    expect(nextLink).toBeInTheDocument();
    const nextIcon = nextLink.querySelector('svg');
    expect(nextIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
