import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes strings with quotes, commas, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('prevents CSV injection by prepending quote', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('-123')).toBe("'-123")
    expect(csvField('@sum')).toBe("'@sum")
    expect(csvField('\tdata')).toBe("'\tdata")
    expect(csvField('\rdata')).toBe('"\'\rdata"')
  })

  it('does not prepend quote for numeric types', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('does not prepend quote for safe strings', () => {
    expect(csvField('safe')).toBe('safe')
    expect(csvField('123 safe')).toBe('123 safe')
  })
})
