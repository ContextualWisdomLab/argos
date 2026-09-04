import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes quotes and wraps in quotes if necessary', () => {
    expect(csvField('normal string')).toBe('normal string')
    expect(csvField('string with "quotes"')).toBe('"string with ""quotes"""')
    expect(csvField('string,with,commas')).toBe('"string,with,commas"')
    expect(csvField('string\r\nwith\nnewlines')).toBe('"string\r\nwith\nnewlines"')
  })

  it('prevents CSV Injection by prepending a quote', () => {
    expect(csvField('=1+1')).toBe(`'=1+1`)
    expect(csvField('+1')).toBe(`'+1`)
    expect(csvField('-1')).toBe(`'-1`)
    expect(csvField('@sum')).toBe(`'@sum`)
    expect(csvField('\t=1+1')).toBe(`'\t=1+1`)
    expect(csvField('\r=1+1')).toBe(`"'\r=1+1"`)
    expect(csvField('\n=1+1')).toBe(`"'\n=1+1"`)
    expect(csvField(' =1+1')).toBe(`' =1+1`) // space padding
    expect(csvField('\uff1d1+1')).toBe(`'\uff1d1+1`) // full width equals
  })

  it('preserves formatting of safe numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123') // numeric type is safe, not string
    expect(csvField(0)).toBe('0')
  })
})
