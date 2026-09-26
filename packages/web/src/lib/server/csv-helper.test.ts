import { describe, expect, it } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('formats regular strings and numbers properly', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('quotes strings with commas or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
  })

  it('escapes existing double quotes', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('prevents CSV Formula Injection (Macro Injection) by prepending a single quote', () => {
    // Exact prefixes
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
    expect(csvField('\t1+2')).toBe("'\t1+2")
    // \r and \n are also matched by /[\",\\r\\n]/ so they get quoted
    expect(csvField('\r1+2')).toBe("\"'\r1+2\"")
    expect(csvField('\n1+2')).toBe("\"'\n1+2\"")

    // Full-width prefixes
    expect(csvField('\uff1d1+2')).toBe("'\uff1d1+2")
    expect(csvField('\uff0b1+2')).toBe("'\uff0b1+2")
    expect(csvField('\uff0d1+2')).toBe("'\uff0d1+2")
    expect(csvField('\uff201+2')).toBe("'\uff201+2")

    // With leading spaces
    expect(csvField('  =1+2')).toBe("'  =1+2")
    expect(csvField(' \t-1+2')).toBe("' \t-1+2")

    // Combining prefixes and quotes/commas
    expect(csvField('=1,2')).toBe("\"'=1,2\"")
  })
})
