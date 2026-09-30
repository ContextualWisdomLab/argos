import { describe, expect, it } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('escapes macro/formula injection characters with a single quote', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)")
    expect(csvField('  =1+2')).toBe("'  =1+2")
    expect(csvField('＝1+2')).toBe("'＝1+2")
    expect(csvField('＋1+2')).toBe("'＋1+2")
    expect(csvField('－1+2')).toBe("'－1+2")
    expect(csvField('＠1+2')).toBe("'＠1+2")
  })

  it('escapes macro characters with quotes if there are newlines or quotes', () => {
    expect(csvField('=\n1+2')).toBe("\"'=\n1+2\"")
    expect(csvField('=@SUM("A1")')).toBe("\"'=@SUM(\"\"A1\"\")\"")
  })

  it('does not escape normal text strings', () => {
    expect(csvField('hello world')).toBe('hello world')
    expect(csvField('123 abc')).toBe('123 abc')
    expect(csvField('test = 1')).toBe('test = 1')
  })

  it('does not escape raw numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('properly quotes strings containing quotes or newlines', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello,world')).toBe('"hello,world"')
  })
})
