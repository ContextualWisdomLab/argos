import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns raw string for numbers to preserve formatting', () => {
    expect(csvField(42)).toBe('42')
    expect(csvField(-42.5)).toBe('-42.5') // Note: typeof value === 'number', so the - is not prepended with '
    expect(csvField(0)).toBe('0')
  })

  it('returns normal string without modification', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('123')).toBe('123')
  })

  it('prepends single quote to mitigate CSV Formula Injection (Macro Injection)', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@SUM(1+2)')).toBe("'@SUM(1+2)")
    expect(csvField('\tcmd')).toBe("'\tcmd")
    expect(csvField('\rcmd')).toBe('"\'' + '\rcmd"') // It has \r so it gets quoted
  })

  it('quotes fields that contain commas, quotes, or newlines (after applying injection protection)', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')

    // Formula injection that also needs quoting
    expect(csvField('=1,2')).toBe('"' + "'=1,2" + '"')
    expect(csvField('+1\n2')).toBe('"' + "'+1\n2" + '"')
  })
})
