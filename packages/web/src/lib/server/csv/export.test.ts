import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes quotes and wraps in quotes if text contains a quote', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('wraps in quotes if text contains comma', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
  })

  it('wraps in quotes if text contains newlines', () => {
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('prepends a single quote to string values starting with formula chars', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
    expect(csvField('\t1+2')).toBe("'\t1+2")
    expect(csvField('\r1+2')).toBe('"\'\r1+2"')
  })

  it('does not prepend single quote to raw numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('handles formula characters combined with quotes or commas properly', () => {
    expect(csvField('="hello"')).toBe('"\'=""hello"""')
  })
})
