import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('does not quote normal strings', () => {
    expect(csvField('hello')).toBe('hello')
  })

  it('quotes strings with commas', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
  })

  it('quotes strings with quotes and escapes them', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('does not prepend quotes to numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-456)).toBe('-456')
  })

  it('prevents CSV injection by prepending quote for dangerous start characters', () => {
    const dangerous = ['=', '+', '-', '@', '\t', '\r', '\n', '\uff1d', '\uff0b', '\uff0d', '\uff20']

    for (const char of dangerous) {
      const result = csvField(char + 'malicious')
      if (char === '\r' || char === '\n') {
        expect(result).toBe("\"'" + char + 'malicious"')
      } else {
        expect(result).toBe("'" + char + "malicious")
      }
    }
  })

  it('prevents CSV injection even with leading spaces', () => {
    expect(csvField('   =cmd|...')).toBe("'   =cmd|...")
  })
})
