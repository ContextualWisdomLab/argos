import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('formats normal strings correctly', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('hello world')).toBe('hello world')
  })

  it('formats numbers correctly', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
    expect(csvField(-123)).toBe('-123')
  })

  it('escapes strings with quotes, commas, or newlines', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('prepends single quote for strings vulnerable to CSV Formula Injection', () => {
    expect(csvField('=1+1')).toBe('"\'=1+1"')
    expect(csvField('=SUM(A1:A2)')).toBe('"\'=SUM(A1:A2)"')
    expect(csvField('+1+1')).toBe('"\'+1+1"')
    expect(csvField('-1+1')).toBe('"\'-1+1"')
    expect(csvField('@SUM(A1)')).toBe('"\'@SUM(A1)"')
    expect(csvField('\t1+1')).toBe('"\'\t1+1"')
    expect(csvField('\r1+1')).toBe('"\'\r1+1"')
  })

  it('escapes quotes in malicious inputs properly', () => {
    expect(csvField('="hello"')).toBe('"\'=""hello"""')
  })
})
