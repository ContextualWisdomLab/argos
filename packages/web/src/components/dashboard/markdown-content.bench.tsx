import { bench, describe } from 'vitest'
import { render } from '@testing-library/react'
import { MarkdownContent } from './markdown-content'
import React from 'react'

const corpus = `
# This is a test
Here is some **bold** text and some *italic* text.
- item 1
- item 2
- item 3

> blockquote

\`\`\`ts
const x = 1;
\`\`\`
`

describe('MarkdownContent Performance', () => {
  bench('renders markdown', () => {
    const { unmount } = render(<MarkdownContent>{corpus}</MarkdownContent>)
    unmount()
  })

  bench('memoized re-render', () => {
    const { rerender, unmount } = render(<MarkdownContent>{corpus}</MarkdownContent>)
    rerender(<MarkdownContent>{corpus}</MarkdownContent>)
    unmount()
  })
})
