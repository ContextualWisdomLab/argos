import { expect, test, describe } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  test('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  test('handles numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
    expect(csvField(-123)).toBe('-123')
  })

  test('handles basic strings', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('123')).toBe('123')
  })

  test('quotes strings with special CSV characters', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  test('prevents CSV macro injection and handles quoting correctly', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('\rcmd')).toBe('"\'\rcmd"')
    expect(csvField('\ncmd')).toBe('"\'\ncmd"')
  })
})
