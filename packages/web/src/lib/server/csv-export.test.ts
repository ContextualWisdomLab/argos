import { describe, expect, it } from 'vitest'
import { csvField } from './csv-export'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles normal strings and numbers', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
  })

  it('escapes strings with commas, quotes, and newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('he"llo')).toBe('"he""llo"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('prevents CSV Formula Injection', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)")
    expect(csvField('\tsomething')).toBe("'\tsomething")
    // \r and \n triggers CSV quoting as well
    expect(csvField('\rsomething')).toBe('"\'\rsomething"')
  })

  it('does not prepend quote for raw numbers that start with + or -', () => {
    expect(csvField(-123)).toBe('-123')
  })
})
