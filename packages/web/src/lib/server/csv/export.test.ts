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

  it('neutralizes formula-leading string cells before CSV quoting', () => {
    expect(csvField('=1+1')).toBe(`'=1+1`)
    expect(csvField('+1')).toBe(`'+1`)
    expect(csvField('-1')).toBe(`'-1`)
    expect(csvField('@sum')).toBe(`'@sum`)
    expect(csvField('\t=1+1')).toBe(`'\t=1+1`)
    expect(csvField('\r=1+1')).toBe(`"'\r=1+1"`)
    expect(csvField('\n=1+1')).toBe(`"'\n=1+1"`)
    expect(csvField(' =1+1')).toBe(`' =1+1`)
    expect(csvField('\u00a0=1+1')).toBe(`'\u00a0=1+1`)
    expect(csvField('=SUM(1,2)')).toBe(`"'=SUM(1,2)"`)
  })

  it('neutralizes full-width formula initiators used by some spreadsheet locales', () => {
    expect(csvField('\uff1d1+1')).toBe(`'\uff1d1+1`)
    expect(csvField('\uff0b1')).toBe(`'\uff0b1`)
    expect(csvField('\uff0d1')).toBe(`'\uff0d1`)
    expect(csvField('\uff20sum')).toBe(`'\uff20sum`)
  })

  it('preserves formatting of safe values', () => {
    expect(csvField('')).toBe('')
    expect(csvField("'already-text")).toBe("'already-text")
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })
})
