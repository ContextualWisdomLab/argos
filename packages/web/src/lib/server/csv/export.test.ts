import { describe, expect, it } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('does not prepend quote for negative numbers', () => {
    expect(csvField(-5)).toBe('-5')
    expect(csvField(-123.45)).toBe('-123.45')
  })

  it('does not prepend quote for positive numbers', () => {
    expect(csvField(5)).toBe('5')
    expect(csvField(123.45)).toBe('123.45')
  })

  it('prepends quote for formula injection characters', () => {
    expect(csvField('=1+2')).toBe(`'=1+2`)
    expect(csvField('+1+2')).toBe(`'+1+2`)
    expect(csvField('-1+2')).toBe(`'-1+2`)
    expect(csvField('@SUM(A1)')).toBe(`'@SUM(A1)`)
    expect(csvField('\tdata')).toBe(`'\tdata`)
    expect(csvField('\rdata')).toBe(`"'\rdata"`) // \r is caught by /[",\r\n]/
  })

  it('escapes quotes and handles newlines', () => {
    expect(csvField('a"b')).toBe('"a""b"')
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('a\nb')).toBe('"a\nb"')
    expect(csvField('a\rb')).toBe('"a\rb"')
  })

  it('does not escape normal text', () => {
    expect(csvField('hello world')).toBe('hello world')
    expect(csvField('123')).toBe('123')
  })
})
