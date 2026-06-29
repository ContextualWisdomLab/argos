import { describe, it, expect } from 'vitest'
import { csvField } from './csvField'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('converts numbers to strings', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes and wraps in quotes if text contains quotes', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('wraps in quotes if text contains commas or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('prepends a single quote to prevent CSV injection for =, +, -, @, \t, \r', () => {
    expect(csvField('=cmd|C')).toBe("'=" + 'cmd|C')
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@sum(1,2),a')).toBe('"\'@sum(1,2),a"')
    expect(csvField('\tsome text')).toBe("'\tsome text")
    expect(csvField('\rsome text')).toBe('"\'\rsome text"')
  })

  it('does not prepend a quote for normal text', () => {
    expect(csvField('normal text')).toBe('normal text')
  })
})
