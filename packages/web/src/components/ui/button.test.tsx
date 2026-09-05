import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ButtonLoadingContent } from './button'

describe('ButtonLoadingContent', () => {
  it('keeps loading copy readable while the decorative spinner respects reduced motion', () => {
    const markup = renderToStaticMarkup(
      <ButtonLoadingContent>Signing in...</ButtonLoadingContent>,
    )

    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('animate-spin')
    expect(markup).toContain('motion-reduce:animate-none')
    expect(markup).toContain('Signing in...')
  })
})
