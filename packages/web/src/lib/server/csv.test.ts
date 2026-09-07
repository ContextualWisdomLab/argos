import { describe, expect, it } from 'vitest'

import { csvField } from './csv'

describe('csvField', () => {
  it('preserves null, numeric, and ordinary scalar values', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
    expect(csvField(42)).toBe('42')
    expect(csvField(-42)).toBe('-42')
    expect(csvField('ordinary text')).toBe('ordinary text')
  })

  it('applies RFC 4180 quoting and quote doubling', () => {
    expect(csvField('alpha,beta')).toBe('"alpha,beta"')
    expect(csvField('say "hello"')).toBe('"say ""hello"""')
    expect(csvField('line one\r\nline two')).toBe('"line one\r\nline two"')
  })

  it.each([
    ['=SUM(1,2)', '"\t=SUM(1,2)"'],
    ['+1+2', '"\t+1+2"'],
    ['-2+3', '"\t-2+3"'],
    ['@SUM(A1:A2)', '"\t@SUM(A1:A2)"'],
    ['\t=1+1', '"\t\t=1+1"'],
    ['\r=1+1', '"\t\r=1+1"'],
    ['\n=1+1', '"\t\n=1+1"'],
  ])('neutralizes spreadsheet formula input %j', (input, expected) => {
    expect(csvField(input)).toBe(expected)
  })
})
