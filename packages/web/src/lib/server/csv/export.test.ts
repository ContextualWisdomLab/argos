import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns number as is', () => {
    expect(csvField(123)).toBe(123)
    expect(csvField(0)).toBe(0)
    expect(csvField(-45.6)).toBe(-45.6)
  })

  it('returns normal string as is', () => {
    expect(csvField('hello world')).toBe('hello world')
  })

  it('quotes strings containing commas', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
  })

  it('quotes strings containing quotes and escapes them', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('quotes strings containing newlines', () => {
    expect(csvField('hello\r\nworld')).toBe('"hello\r\nworld"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
  })

  it('prepends single quote to prevent CSV injection (=)', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
  })

  it('prepends single quote to prevent CSV injection (+)', () => {
    expect(csvField('+1+1')).toBe("'+1+1")
  })

  it('prepends single quote to prevent CSV injection (-)', () => {
    expect(csvField('-1+1')).toBe("'-1+1")
  })

  it('prepends single quote to prevent CSV injection (@)', () => {
    expect(csvField('@1+1')).toBe("'@1+1")
  })

  it('prepends single quote to prevent CSV injection (\\t)', () => {
    expect(csvField('\t1+1')).toBe("'\t1+1")
  })

  it('prepends single quote to prevent CSV injection (\\r)', () => {
    expect(csvField('\r1+1')).toBe('"\'\r1+1"')
  })
})
