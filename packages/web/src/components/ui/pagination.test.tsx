/** @vitest-environment jsdom */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Pagination } from './pagination';

describe('Pagination accessibility', () => {
  it('hides navigation icons without hiding labeled actions', () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        total={100}
        onPageChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole('button', { name: '이전 페이지' });
    expect(prevButton).toBeInTheDocument();
    const prevIcon = prevButton.querySelector('svg');
    expect(prevIcon).toHaveAttribute('aria-hidden', 'true');

    const nextButton = screen.getByRole('button', { name: '다음 페이지' });
    expect(nextButton).toBeInTheDocument();
    const nextIcon = nextButton.querySelector('svg');
    expect(nextIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
