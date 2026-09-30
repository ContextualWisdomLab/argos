/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SelectScrollUpButton, SelectScrollDownButton, SelectTrigger } from './select'

globalThis.React = React;

// In order to let `render` build the DOM without Base UI throwing context errors,
// we mock the primitives that these components use so they just render standard divs/buttons.
// This allows the actual components we want to test to mount to the DOM, rendering
// the Lucide icons inside them, which we can then query and assert on.

vi.mock('@base-ui/react/select', () => {
  return {
    Select: {
      ScrollUpArrow: React.forwardRef(({ children, className, ...props }: any, ref: any) => <div ref={ref} className={className} {...props}>{children}</div>),
      ScrollDownArrow: React.forwardRef(({ children, className, ...props }: any, ref: any) => <div ref={ref} className={className} {...props}>{children}</div>),
      Trigger: React.forwardRef(({ children, className, ...props }: any, ref: any) => <button ref={ref} className={className} {...props}>{children}</button>),
      Icon: ({ render: renderer }: any) => renderer
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
