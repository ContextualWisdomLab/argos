import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles numbers without escaping', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-45.6)).toBe('-45.6')
    expect(csvField(0)).toBe('0')
  })

  it('handles normal strings', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('abc 123')).toBe('abc 123')
  })

  it('wraps strings with commas, quotes, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('say "hello"')).toBe('"say ""hello"""')
    expect(csvField('line1\nline2')).toBe('"line1\nline2"')
    expect(csvField('line1\r\nline2')).toBe('"line1\r\nline2"')
  })

  it('prevents CSV injection by prepending a single quote', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)")
    expect(csvField('\t123')).toBe("'\t123")
    expect(csvField('\r123')).toBe('"\'\r123"')
    expect(csvField('\n123')).toBe('"\'\n123"')
  })

  it('prevents CSV injection with full-width characters', () => {
    expect(csvField('＝1+2')).toBe("'＝1+2")
    expect(csvField('＋1+2')).toBe("'＋1+2")
    expect(csvField('－1+2')).toBe("'－1+2")
    expect(csvField('＠SUM(A1:A2)')).toBe("'＠SUM(A1:A2)")
  })

  it('prevents CSV injection even with leading spaces', () => {
    expect(csvField('  =1+2')).toBe("'  =1+2")
    expect(csvField(' \t =1+2')).toBe("' \t =1+2")
  })

  it('handles injection characters that also need quotes', () => {
      expect(csvField('=hello, world')).toBe('"' + "'=hello, world" + '"')
  })
})
