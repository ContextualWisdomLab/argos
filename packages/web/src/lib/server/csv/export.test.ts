import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('formats normal strings correctly', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('hello world')).toBe('hello world')
  })

  it('preserves numbers without prepending quotes', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes, commas, and newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"\hello\rworld"')
  })

  it('prevents CSV injection by prepending a single quote for strings', () => {
    expect(csvField('=CMD|A1')).toBe("'=CMD|A1")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('-123')).toBe("'-123")
    expect(csvField('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)")
    expect(csvField('\tData')).toBe("'\tData")
  })

  it('handles strings starting with injection characters that also need quoting', () => {
    expect(csvField('=CMD,"A1"')).toBe('"\'=CMD,""A1"""')
    expect(csvField('\rData')).toBe('"\'\rData"')
  })
})
