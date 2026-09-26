/** @vitest-environment jsdom */
/* eslint-disable react/display-name */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Base UI internals mock to bypass context requirements while retaining the DOM structure
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
      Icon: React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'> & { render?: React.ReactNode }>(({ ...props }, ref) => (
        <span ref={ref} data-slot="select-icon" {...props}>{props.render}</span>
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
    }
  };
});

describe('Select accessibility', () => {
  it('hides decorative chevrons from screen readers in trigger and scroll buttons', () => {
    // Render our wrapper components which inject the actual SVGs

    // 1. Test Trigger
    const { unmount: unmountTrigger } = render(
      <SelectTrigger aria-label="Choose an option">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
    );
    const triggerBtn = screen.getByRole('combobox');
    const triggerSvg = triggerBtn.querySelector('svg');
    expect(triggerSvg).toHaveAttribute('aria-hidden', 'true');
    unmountTrigger();

    // 2. Test Up Button
    const { container: upContainer, unmount: unmountUp } = render(<SelectScrollUpButton />);
    const upButton = upContainer.querySelector('[data-slot="select-scroll-up-button"]');
    expect(upButton?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    unmountUp();

    // 3. Test Down Button
    const { container: downContainer } = render(<SelectScrollDownButton />);
    const downButton = downContainer.querySelector('[data-slot="select-scroll-down-button"]');
    expect(downButton?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
