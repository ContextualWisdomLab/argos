/** @vitest-environment jsdom */

import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { Select, SelectTrigger, SelectValue } from './select'

describe('SelectTrigger accessibility', () => {
  afterEach(cleanup)

  /**
   * Keeps the trigger's Chevron decorative while preserving the explicit
   * combobox name supplied by the product surface.
   */
  it('does not include the trigger icon in the accessible name', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Report type">
          <SelectValue placeholder="Choose report" />
        </SelectTrigger>
      </Select>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Report type' })

    expect(trigger).toBeInTheDocument()
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
