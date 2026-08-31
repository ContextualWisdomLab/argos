import { describe, it, expect } from 'vitest'
import { sanitizeCsvField } from './csv'

describe('sanitizeCsvField security enhancements', () => {
  it('prevents CSV Injection by prepending single quotes to formula triggers', () => {
    expect(sanitizeCsvField('=cmd|C\\calc!A0')).toBe("'=" + "cmd|C\\calc!A0")
    expect(sanitizeCsvField('+1+2')).toBe("'+1+2")
    expect(sanitizeCsvField('-SUM(A1:A10)')).toBe("'-SUM(A1:A10)")
    expect(sanitizeCsvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)")
  })

  it('handles padded formula triggers correctly', () => {
    expect(sanitizeCsvField('  =1+1')).toBe("'  =1+1")
    expect(sanitizeCsvField('\t-2')).toBe("'\t-2")
  })

  it('escapes quotes correctly while maintaining injection protection', () => {
    expect(sanitizeCsvField('="malicious"')).toBe(`"'=""malicious"""`)
    expect(sanitizeCsvField(null)).toBe('')
    expect(sanitizeCsvField(undefined)).toBe('')
  })

  it('passes normal text unchanged', () => {
    expect(sanitizeCsvField('Normal text')).toBe('Normal text')
    expect(sanitizeCsvField('123')).toBe('123')
  })

  it('escapes quotes in normal text correctly', () => {
    expect(sanitizeCsvField('Text "with" quotes')).toBe(`"Text ""with"" quotes"`)
    expect(sanitizeCsvField('Text, with comma')).toBe(`"Text, with comma"`)
    expect(sanitizeCsvField('Text\nwith newline')).toBe(`"Text\nwith newline"`)
  })
})
