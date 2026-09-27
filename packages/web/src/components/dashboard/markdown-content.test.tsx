/** @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from './markdown-content'

describe('MarkdownContent', () => {
  it('sanitizes javascript: URIs to prevent XSS', () => {
    const markdown = '[Click here](javascript:alert(1))'
    render(<MarkdownContent>{markdown}</MarkdownContent>)

    const link = screen.getByText('Click here')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('')
  })

  it('allows safe http: and https: URIs', () => {
    const markdown = '[Click here](https://example.com)'
    render(<MarkdownContent>{markdown}</MarkdownContent>)

    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link.getAttribute('href')).toBe('https://example.com')
  })
})
