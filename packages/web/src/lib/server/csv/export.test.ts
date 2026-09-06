import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('escapes macro injection characters', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@1+1')).toBe("'@1+1")
    expect(csvField('\t1+1')).toBe("'\t1+1")
    expect(csvField('\r1+1')).toBe("\"'\r1+1\"")
    expect(csvField('\n1+1')).toBe("\"'\n1+1\"")
    expect(csvField('  =1+1')).toBe("'  =1+1")
    expect(csvField('\uFF1D1+1')).toBe("'\uFF1D1+1")
  })

  it('preserves numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('escapes quotes and newlines', () => {
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })
})
