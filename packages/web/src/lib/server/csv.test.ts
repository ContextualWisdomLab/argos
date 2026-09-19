import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes strings starting with formula injection characters', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField(' =cmd|')).toBe("' =cmd|")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('-123')).toBe("'-123")
    expect(csvField('@123')).toBe("'@123")
    expect(csvField('\t123')).toBe("'\t123")
    expect(csvField('\r123')).toBe("\"'\r123\"")
    expect(csvField('\n123')).toBe("\"'\n123\"")
    expect(csvField('\uff1d123')).toBe("'\uff1d123")
  })

  it('does not escape number types', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('handles quotes correctly', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('does not escape normal strings', () => {
    expect(csvField('normal string')).toBe('normal string')
  })
})
