import { describe, expect, it } from 'vitest'

import { csvField } from './csv'

describe('csvField', () => {
  it.each([
    ['=1+1', "'=1+1"],
    [' +SUM(A1:A2)', "' +SUM(A1:A2)"],
    ['\t@SUM(A1:A2)', "'\t@SUM(A1:A2)"],
    ['\r-1', '"\'\r-1"'],
  ])('neutralizes spreadsheet formula admission for %j', (input, expected) => {
    expect(csvField(input)).toBe(expected)
  })

  it('preserves ordinary CSV escaping after formula admission', () => {
    expect(csvField('plain')).toBe('plain')
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('"quoted"')).toBe('"""quoted"""')
    expect(csvField(null)).toBe('')
  })
})
