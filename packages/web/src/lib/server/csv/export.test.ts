import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles normal strings and numbers', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
    expect(csvField(-10)).toBe('-10')
  })

  it('escapes characters for formula injection but not numbers', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    // @SUM(1,1) contains a comma, so it will be wrapped in quotes
    expect(csvField('@SUM(1,1)')).toBe("\"'@SUM(1,1)\"")
    expect(csvField('\tdata')).toBe("'\tdata")
    // \rdata contains \r, so it will be wrapped in quotes
    expect(csvField('\rdata')).toBe("\"'\rdata\"")
    // numbers shouldn't be escaped even if they start with - or + (though + doesn't normally happen in JS numbers without string conversion, - does)
  })

  it('wraps fields with quotes and escapes internal quotes', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('line1\r\nline2')).toBe('"line1\r\nline2"')
    expect(csvField('he said "hi"')).toBe('"he said ""hi"""')
  })

  it('handles injection characters inside quotes', () => {
    expect(csvField('=cmd,"hi"')).toBe(`"'=cmd,""hi"""`)
  })
})
