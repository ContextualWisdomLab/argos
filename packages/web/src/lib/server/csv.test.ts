import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('escapes formula injection characters', () => {
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+cmd')).toBe("'+cmd")
    expect(csvField('-cmd')).toBe("'-cmd")
    expect(csvField('@cmd')).toBe("'@cmd")
  })

  it('escapes formula and control prefixes after leading whitespace', () => {
    expect(csvField('  =cmd')).toBe("'  =cmd")
    expect(csvField('\u00a0=cmd')).toBe("'\u00a0=cmd")
    expect(csvField('  \ttext')).toBe("'  \ttext")
    expect(csvField('\v=cmd')).toBe("'\v=cmd")
    expect(csvField('\f@cmd')).toBe("'\f@cmd")
    expect(csvField('  \0=cmd')).toBe("'  \0=cmd")
  })

  it('escapes control prefixes themselves', () => {
    expect(csvField('\ttext')).toBe("'\ttext")
    expect(csvField('\rtext')).toBe("\"'\rtext\"")
    expect(csvField('\ntext')).toBe("\"'\ntext\"")
    expect(csvField('\0text')).toBe("'\0text")
  })

  it('escapes full-width formula prefixes', () => {
    expect(csvField('\uff1dcmd')).toBe("'\uff1dcmd")
    expect(csvField('\uff0bcmd')).toBe("'\uff0bcmd")
    expect(csvField('\uff0dcmd')).toBe("'\uff0dcmd")
    expect(csvField('\uff20cmd')).toBe("'\uff20cmd")
  })

  it('does not escape actual numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('keeps separator, quote, and line-break payloads inside one serialized field', () => {
    expect(csvField('safe,=1+2')).toBe('"safe,=1+2"')
    expect(csvField('safe",=1+2')).toBe('"safe"",=1+2"')
    expect(csvField('safe\r\n=1+2')).toBe('"safe\r\n=1+2"')
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})
