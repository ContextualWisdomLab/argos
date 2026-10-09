import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { csvField } from './route'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles normal strings', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('123hello')).toBe('123hello')
  })

  it('handles numbers correctly without escaping', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes strings starting with formula characters', () => {
    expect(csvField('=cmd|/c calc.exe!A0')).toBe("'=cmd|/c calc.exe!A0")
    expect(csvField('+cmd|/c calc.exe!A0')).toBe("'+cmd|/c calc.exe!A0")
    expect(csvField('-cmd|/c calc.exe!A0')).toBe("'-cmd|/c calc.exe!A0")
    expect(csvField('@cmd|/c calc.exe!A0')).toBe("'@cmd|/c calc.exe!A0")
    expect(csvField('＝cmd')).toBe("'＝cmd")
    expect(csvField('＋cmd')).toBe("'＋cmd")
    expect(csvField('－cmd')).toBe("'－cmd")
    expect(csvField('＠cmd')).toBe("'＠cmd")
  })

  it('escapes strings starting with spaces followed by formula characters', () => {
    expect(csvField('   =cmd|/c calc.exe!A0')).toBe("'   =cmd|/c calc.exe!A0")
    expect(csvField(' +cmd')).toBe("' +cmd")
  })

  it('wraps strings containing commas in quotes', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello, world')).toBe('"hello, world"')
  })

  it('wraps strings containing quotes in quotes and escapes them', () => {
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('wraps strings containing newlines in quotes', () => {
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('handles formula characters combined with quotes/commas', () => {
    expect(csvField('=hello,world')).toBe('"' + "'=hello,world" + '"')
    expect(csvField('=hello"world')).toBe('"' + "'=hello\"\"world" + '"')
  })
})
