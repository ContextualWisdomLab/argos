import { describe, expect, it } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('preserves numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-456)).toBe('-456')
    expect(csvField(0)).toBe('0')
  })

  it('prepends single quote to formula injection triggers', () => {
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+cmd')).toBe("'+cmd")
    expect(csvField('-cmd')).toBe("'-cmd")
    expect(csvField('@cmd')).toBe("'@cmd")
    expect(csvField('\tcmd')).toBe("'\tcmd")
    // \r and \n are handled by the next check and will be quoted
    expect(csvField('\rcmd')).toBe('"\'\rcmd"')
    expect(csvField('\ncmd')).toBe('"\'\ncmd"')
  })

  it('prepends single quote to full-width formula injection triggers', () => {
    expect(csvField('\uff1dcmd')).toBe("'\uff1dcmd")
    expect(csvField('\uff0bcmd')).toBe("'\uff0bcmd")
    expect(csvField('\uff0dcmd')).toBe("'\uff0dcmd")
    expect(csvField('\uff20cmd')).toBe("'\uff20cmd")
  })

  it('prepends single quote even with leading spaces', () => {
    expect(csvField(' =cmd')).toBe("' =cmd")
    expect(csvField('  -cmd')).toBe("'  -cmd")
    expect(csvField(' \tcmd')).toBe("' \tcmd")
  })

  it('escapes quotes and handles commas', () => {
    expect(csvField('normal,string')).toBe('"normal,string"')
    expect(csvField('string with "quotes"')).toBe('"string with ""quotes"""')
    expect(csvField('multi\nline')).toBe('"multi\nline"')
  })

  it('does not prepend quote for normal strings', () => {
    expect(csvField('normal')).toBe('normal')
    expect(csvField(' normal')).toBe(' normal')
    expect(csvField('123')).toBe('123')
  })

  it('combines formula injection prevention with quote escaping', () => {
    expect(csvField('=cmd,test')).toBe('"\'=cmd,test"')
    expect(csvField('=-"test"')).toBe('"\'=-""test"""')
  })
})
