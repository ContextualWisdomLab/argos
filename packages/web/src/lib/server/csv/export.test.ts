import { describe, it, expect } from 'vitest'
import { csvField } from './export'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('does not prepend single quote to raw numbers even if they start with minus or plus', () => {
    expect(csvField(-123)).toBe('-123')
    expect(csvField(+456)).toBe('456') // + in number literal is evaluated by JS before passing
  })

  it('prepends single quote to strings starting with vulnerable characters', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
    expect(csvField('\t1+2')).toBe("'\t1+2")
    expect(csvField('\r1+2')).toBe('"\'\r1+2"')
  })

  it('wraps strings containing quotes, commas, or newlines in double quotes', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  it('combines quoting and prepending when necessary', () => {
    expect(csvField('=hello, world')).toBe('"' + "'=hello, world" + '"')
  })

  it('leaves safe strings as is', () => {
    expect(csvField('safe string')).toBe('safe string')
  })
})
