import { describe, test, expect } from 'vitest'
import { csvField } from './csv'

describe('CSV field escaping', () => {
  test('escapes formula injection characters for strings', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('  +foo')).toBe("'  +foo")
    expect(csvField('-foo')).toBe("'-foo")
    expect(csvField('@foo')).toBe("'@foo")
    expect(csvField('\tfoo')).toBe("'\tfoo")
    expect(csvField('  \r\nfoo')).toBe("\"'  \r\nfoo\"")
    expect(csvField('  \uff1dfoo')).toBe("'  \uff1dfoo")
  })

  test('does not escape numeric values', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  test('escapes double quotes and newlines', () => {
    expect(csvField('foo"bar')).toBe('"foo""bar"')
    expect(csvField('foo\nbar')).toBe('"foo\nbar"')
    expect(csvField('foo,bar')).toBe('"foo,bar"')
  })

  test('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})
