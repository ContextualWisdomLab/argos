/** @vitest-environment jsdom */
/* eslint-disable react/display-name */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectContent,
} from './select';

// Mock the Base UI select to bypass context requirements while retaining the DOM structure and props
vi.mock('@base-ui/react/select', async () => {
  const actual = await vi.importActual('@base-ui/react/select');
  return {
    ...actual,
    Select: {
      ...actual.Select,
      Root: ({ children }: { children: React.ReactNode }) => <div data-testid="select-root">{children}</div>,
      Value: React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(({ children, ...props }, ref) => (
        <span ref={ref} data-slot="select-value" {...props}>{children}</span>
      )),
      Icon: React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'> & { render?: React.ReactNode }>(({ render, ...props }, ref) => (
        <span ref={ref} data-slot="select-icon" {...props}>{render}</span>
      )),
      Trigger: React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(({ children, ...props }, ref) => (
        // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
        <button ref={ref} role="combobox" {...props}>{children}</button>
      )),
      ScrollUpArrow: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ children, ...props }, ref) => (
        <div ref={ref} data-slot="select-scroll-up-button" {...props}>{children}</div>
      )),
      ScrollDownArrow: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ children, ...props }, ref) => (
        <div ref={ref} data-slot="select-scroll-down-button" {...props}>{children}</div>
      )),
      Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Positioner: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Popup: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ children, ...props }, ref) => (
        <div ref={ref} data-slot="select-content" {...props}>{children}</div>
      )),
      List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    }
  };
});

describe('Select accessibility', () => {
  it('hides decorative chevrons from screen readers in trigger and scroll buttons', () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="Choose an option">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    );

    const triggerBtn = screen.getByRole('combobox');
    const triggerSvg = triggerBtn.querySelector('svg');
    expect(triggerSvg).toHaveAttribute('aria-hidden', 'true');

    const upButton = container.querySelector('[data-slot="select-scroll-up-button"]');
    expect(upButton).toBeInTheDocument();
    expect(upButton?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    const downButton = container.querySelector('[data-slot="select-scroll-down-button"]');
    expect(downButton).toBeInTheDocument();
    expect(downButton?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
