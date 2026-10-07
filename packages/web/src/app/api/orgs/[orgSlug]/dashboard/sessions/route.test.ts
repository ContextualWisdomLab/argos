import { vi } from 'vitest'
vi.mock('server-only', () => ({}))
import { expect, it, describe } from 'vitest'
import { csvField } from './route'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles normal strings', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('hello world')).toBe('hello world')
  })

  it('handles numbers without adding a quote', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('quotes fields containing quotes, commas, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('prevents CSV injection by adding a quote for =+-@', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
  })

  it('prevents CSV injection with leading spaces', () => {
    expect(csvField('  =1+2')).toBe("'  =1+2")
    expect(csvField('\t +1+2')).toBe("'\t +1+2")
    expect(csvField('\n-1+2')).toBe('"\'\n-1+2"')
  })

  it('prevents CSV injection with full-width characters', () => {
    expect(csvField('＝1+2')).toBe("'＝1+2")
    expect(csvField('＋1+2')).toBe("'＋1+2")
    expect(csvField('－1+2')).toBe("'－1+2")
    expect(csvField('＠1+2')).toBe("'＠1+2")
  })
})
