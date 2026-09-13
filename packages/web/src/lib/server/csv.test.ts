import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('escapes formula injection characters', () => {
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+cmd')).toBe("'+cmd")
    expect(csvField('-cmd')).toBe("'-cmd")
    expect(csvField('@cmd')).toBe("'@cmd")
  })

  it('escapes formula injection characters with leading whitespace', () => {
    expect(csvField('  =cmd')).toBe("'  =cmd")
    expect(csvField('\t+cmd')).toBe("'\t+cmd")
  })

  it('neutralizes spreadsheet control-character prefixes themselves', () => {
    expect(csvField('\ttext')).toBe("'\ttext")
    expect(csvField('\rtext')).toBe('"\'\rtext"')
    expect(csvField('\ntext')).toBe('"\'\ntext"')
    expect(csvField('\0text')).toBe("'\0text")
  })

  it('escapes full-width formula injection characters', () => {
    expect(csvField('\uff1dcmd')).toBe("'\uff1dcmd")
    expect(csvField('\uff0bcmd')).toBe("'\uff0bcmd")
    expect(csvField('\uff0dcmd')).toBe("'\uff0dcmd")
    expect(csvField('\uff20cmd')).toBe("'\uff20cmd")
  })

  it('does not escape actual numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('escapes quotes and separators without creating a new cell', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
    expect(csvField('safe,=cmd')).toBe('"safe,=cmd"')
  })

  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})
