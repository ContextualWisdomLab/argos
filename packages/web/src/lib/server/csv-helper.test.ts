import { describe, it, expect } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('keeps typed numbers as numeric CSV cells', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('neutralizes formula-leading string cells', () => {
    expect(csvField('=cmd|')).toBe('"\'=cmd|"')
    expect(csvField('+cmd|')).toBe('"\'+cmd|"')
    expect(csvField('-cmd|')).toBe('"\'-cmd|"')
    expect(csvField('@cmd|')).toBe('"\'@cmd|"')
    expect(csvField('\tcmd|')).toBe('"\'\tcmd|"')
  })

  it('neutralizes formula prefixes that follow leading whitespace', () => {
    expect(csvField(' =cmd|')).toBe('"\' =cmd|"')
    expect(csvField('  +cmd|')).toBe('"\'  +cmd|"')
    expect(csvField('\t -cmd|')).toBe('"\'\t -cmd|"')
    expect(csvField('\rcmd|')).toBe('"\'\rcmd|"')
    expect(csvField('\ncmd|')).toBe('"\'\ncmd|"')
  })

  it('neutralizes supported full-width formula prefixes', () => {
    expect(csvField('\uff1dcmd|')).toBe('"\'\uff1dcmd|"')
    expect(csvField('\uff0bcmd|')).toBe('"\'\uff0bcmd|"')
    expect(csvField('\uff0dcmd|')).toBe('"\'\uff0dcmd|"')
    expect(csvField('\uff20cmd|')).toBe('"\'\uff20cmd|"')
  })

  it('quotes every string cell and doubles embedded quotes', () => {
    expect(csvField('plain')).toBe('"plain"')
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello;=SUM(A1)')).toBe('"hello;=SUM(A1)"')
    expect(csvField('=-"malicious"')).toBe('"\'=-""malicious"""')
  })
})
