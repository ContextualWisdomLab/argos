import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('escapes macro injection characters', () => {
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+cmd')).toBe("'+cmd")
    expect(csvField('-cmd')).toBe("'-cmd")
    expect(csvField('@cmd')).toBe("'@cmd")
  })

  it('escapes macro injection characters with leading whitespace', () => {
    expect(csvField('  =cmd')).toBe("'  =cmd")
    expect(csvField('\t+cmd')).toBe("'\t+cmd")
  })

  it('escapes ASVS null prefix', () => {
    expect(csvField('\0text')).toBe("'\0text")
  })

  it('escapes full-width macro injection characters', () => {
    expect(csvField('\uff1dcmd')).toBe("'\uff1dcmd")
  })

  it('does not escape actual numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('escapes quotes and commas', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})
