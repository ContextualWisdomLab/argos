import { describe, it, expect } from 'vitest'
import { csvField } from '../export'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles numbers without escaping or prepending', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes and newlines', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
  })

  it('prevents CSV injection', () => {
    expect(csvField('=1+2')).toBe(`"'=1+2"`)
    expect(csvField('+1+2')).toBe(`"'+1+2"`)
    expect(csvField('-1+2')).toBe(`"'-1+2"`)
    expect(csvField('@1+2')).toBe(`"'@1+2"`)
    expect(csvField('\t1+2')).toBe(`"'\t1+2"`)
    expect(csvField('\r1+2')).toBe(`"'\r1+2"`)
  })
})
