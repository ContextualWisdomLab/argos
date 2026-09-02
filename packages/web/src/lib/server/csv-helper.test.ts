import { describe, expect, it } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('quotes fields containing quotes, commas, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello\rworld')).toBe('"hello\rworld"')
    expect(csvField('he said "hello"')).toBe('"he said ""hello"""')
  })

  it('pads dangerous leading characters to prevent CSV injection', () => {
    expect(csvField('=cmd|\' /C calc\'!A0')).toBe("'=cmd|\' /C calc\'!A0")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@SUM(1+1)')).toBe("'@SUM(1+1)")
    expect(csvField('\t=cmd')).toBe("'\t=cmd")
    expect(csvField('\r=cmd')).toBe('"\'\r=cmd"')
    expect(csvField(' =cmd')).toBe("' =cmd")
  })

  it('does not modify normal fields', () => {
    expect(csvField('normal')).toBe('normal')
    expect(csvField(123)).toBe('123')
  })
})
