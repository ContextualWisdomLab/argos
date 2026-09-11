import { describe, it, expect } from 'vitest'
import { csvField } from './csv-export'

describe('csvField', () => {
  it('prevents formula injection', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('  -calc')).toBe("'  -calc")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('@eval')).toBe("'@eval")
  })

  it('preserves numeric types', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes quotes and newlines', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello,world')).toBe('"hello,world"')
  })
})
