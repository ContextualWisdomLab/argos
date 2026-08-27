import { describe, expect, it } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('preserves normal strings', () => {
    expect(csvField('hello')).toBe('hello')
  })

  it('preserves numbers without prepending quote', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('escapes strings with quotes, commas, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('prepends quote for macro injection triggers', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@SUM(A1)')).toBe("'@SUM(A1)")
    expect(csvField('\tdata')).toBe("'\tdata")
    expect(csvField('\rdata')).toBe('"' + "'\rdata" + '"')
  })

  it('wraps injection triggers in quotes if they contain commas', () => {
    expect(csvField('=1,1')).toBe('"' + "'=1,1" + '"')
  })
})
