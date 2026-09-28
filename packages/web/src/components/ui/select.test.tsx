/** @vitest-environment jsdom */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Select, SelectTrigger, SelectContent, SelectScrollUpButton, SelectScrollDownButton } from './select'

globalThis.React = React;
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Select Component', () => {
  it('includes aria-hidden="true" on decorative icons', () => {
    // Only test the parts that render the icons directly or can be triggered
    // SelectTrigger, SelectScrollUpButton, SelectScrollDownButton have Chevron icons
    const { container } = render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
        <SelectContent>
           <SelectScrollUpButton />
           <SelectScrollDownButton />
        </SelectContent>
      </Select>
    )

    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-down, svg.lucide-chevron-up')
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
