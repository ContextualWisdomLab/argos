import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('preserves raw numbers without prepending quote', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes and handles line breaks and commas', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('prepends single quote to prevent CSV Formula Injection for risky leading characters', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)")
    expect(csvField('\t=cmd|/c')).toBe("'\t=cmd|/c")
    expect(csvField('\r=cmd|/c')).toBe('"\'\r=cmd|/c"')
  })

  it('handles combination of injection and quotes', () => {
    expect(csvField('="hello"')).toBe('"\'=""hello"""')
  })

  it('does not prepend quote for safe strings', () => {
    expect(csvField('safe string')).toBe('safe string')
    expect(csvField(' 123')).toBe(' 123') // space is safe
    expect(csvField('a=1')).toBe('a=1')
  })
})
