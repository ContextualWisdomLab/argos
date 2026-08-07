import { describe, expect, it } from 'vitest'

import { encodeCsvField } from './csv-export'

describe('encodeCsvField', () => {
  it('preserves empty and numeric values without converting numeric signs into text', () => {
    expect(encodeCsvField(null)).toBe('')
    expect(encodeCsvField(undefined)).toBe('')
    expect(encodeCsvField(123)).toBe('123')
    expect(encodeCsvField(-123)).toBe('-123')
  })

  it.each([
    ['=HYPERLINK("https://attacker.invalid")', "'=HYPERLINK(\"https://attacker.invalid\")"],
    ['+SUM(1,2)', "'+SUM(1,2)"],
    ['-1+2', "'-1+2"],
    ['@SUM(1,2)', "'@SUM(1,2)"],
    ['\t=1+1', "'\t=1+1"],
    ['\r=1+1', "'\r=1+1"],
    ['\n=1+1', "'\n=1+1"],
    ['\0=1+1', "'\0=1+1"],
    ['＝1+1', "'＝1+1"],
    ['＋1+1', "'＋1+1"],
    ['－1+1', "'－1+1"],
    ['＠SUM(1,2)', "'＠SUM(1,2)"],
  ])('neutralizes spreadsheet formula prefix %j', (value, neutralizedPrefix) => {
    const encoded = encodeCsvField(value)
    expect(encoded.replace(/^"|"$/g, '').replaceAll('""', '"')).toBe(neutralizedPrefix)
  })

  it('quotes delimiters and doubles embedded quotes so attacker data cannot break into a new cell', () => {
    expect(encodeCsvField('safe,=HYPERLINK("https://attacker.invalid")')).toBe(
      '"safe,=HYPERLINK(""https://attacker.invalid"")"'
    )
    expect(encodeCsvField('safe";=1+1')).toBe('"safe"";=1+1"')
  })

  it('preserves ordinary human-readable text', () => {
    expect(encodeCsvField('quarterly report')).toBe('quarterly report')
  })
})
