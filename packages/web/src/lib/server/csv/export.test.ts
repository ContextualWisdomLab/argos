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

  it('does not prepend quote for innocent leading spaces', () => {
    expect(csvField('  hello')).toBe('  hello')
    expect(csvField(' \t hello')).toBe(' \t hello')
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
    expect(csvField('\ndata')).toBe("\"'\ndata\"")

    // Numbers shouldn't be escaped even if they start with - or +
    expect(csvField(-100)).toBe('-100')
    expect(csvField(100)).toBe('100')
  })

  it('blocks formula markers hidden behind leading spaces and locale variants', () => {
    expect(csvField(' =1+2')).toBe("' =1+2")
    expect(csvField('   +1+2')).toBe("'   +1+2")
    expect(csvField(' -1+2')).toBe("' -1+2")
  })

  it('escapes formula characters with leading spaces', () => {
    expect(csvField(' =cmd|')).toBe("' =cmd|")
    expect(csvField('\t +1')).toBe("'\t +1")
    expect(csvField('  -2')).toBe("'  -2")
    expect(csvField(' \r @a')).toBe("\"' \r @a\"")
  })

  it('escapes full-width characters for formula injection', () => {
    expect(csvField('＝cmd')).toBe("'＝cmd")
    expect(csvField('＋1')).toBe("'＋1")
    expect(csvField('－2')).toBe("'－2")
    expect(csvField('＠a')).toBe("'＠a")
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
