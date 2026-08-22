import { describe, it, expect } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns string representations of normal values', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
  })

  it('wraps fields with quotes and escapes internal quotes', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('line1\nline2')).toBe('"line1\nline2"')
    expect(csvField('line1\r\nline2')).toBe('"line1\r\nline2"')
    expect(csvField('a,b')).toBe('"a,b"')
  })

  it('prepends a single quote to prevent CSV injection for dangerous starting characters', () => {
    // If the input doesn't contain a quote, comma, or newline, it just returns the modified string
    expect(csvField('=cmd|\'/C calc\'!A0')).toBe("'=cmd|'/C calc'!A0")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")

    // @SUM(1,1) contains a comma, so it will be wrapped in double quotes
    expect(csvField('@SUM(1,1)')).toBe("\"'@SUM(1,1)\"")

    expect(csvField('\tmalicious')).toBe("'\tmalicious")
    expect(csvField('\rmalicious')).toBe("\"'\rmalicious\"") // \r is a newline character, so it is wrapped

    // \r\nmalicious contains a newline, so it is wrapped in double quotes
    expect(csvField('\r\nmalicious')).toBe("\"'\r\nmalicious\"")
  })
})
