/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SelectScrollUpButton, SelectScrollDownButton, SelectTrigger } from './select'

globalThis.React = React;

// In order to let `render` build the DOM without Base UI throwing context errors,
// we mock the primitives that these components use so they just render standard divs/buttons.
// This allows the actual components we want to test to mount to the DOM, rendering
// the Lucide icons inside them, which we can then query and assert on.

vi.mock('@base-ui/react/select', () => {
  const ScrollUpArrow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ScrollUpArrow({ children, className, ...props }, ref) {
    return <div ref={ref} className={className} {...props}>{children}</div>;
  });
  const ScrollDownArrow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ScrollDownArrow({ children, className, ...props }, ref) {
    return <div ref={ref} className={className} {...props}>{children}</div>;
  });
  const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function Trigger({ children, className, ...props }, ref) {
    return <button ref={ref} className={className} {...props}>{children}</button>;
  });
  const Icon = function Icon({ render: renderer }: { render: React.ReactNode }) {
    return <>{renderer}</>;
  };
  return {
    Select: {
      ScrollUpArrow,
      ScrollDownArrow,
      Trigger,
      Icon
    }
  };
});

describe('Select Component', () => {
  it('includes aria-hidden="true" on decorative icons', () => {

    const { container: triggerContainer } = render(
      <SelectTrigger>
         <span>test</span>
      </SelectTrigger>
    )
    expect(screen.getByRole('button', { name: 'test' })).toBeInTheDocument()
    const triggerChevron = triggerContainer.querySelector('svg.lucide-chevron-down')
    expect(triggerChevron).not.toBeNull()
    expect(triggerChevron).toHaveAttribute('aria-hidden', 'true')

    const { container: upContainer } = render(
      <SelectScrollUpButton />
    )
    const upChevron = upContainer.querySelector('svg.lucide-chevron-up')
    expect(upChevron).not.toBeNull()
    expect(upChevron).toHaveAttribute('aria-hidden', 'true')

    const { container: downContainer } = render(
      <SelectScrollDownButton />
    )
    const downChevron = downContainer.querySelector('svg.lucide-chevron-down')
    expect(downChevron).not.toBeNull()
    expect(downChevron).toHaveAttribute('aria-hidden', 'true')
  })
})
