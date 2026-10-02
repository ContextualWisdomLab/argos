import { describe, it, expect, vi } from 'vitest'
vi.mock('server-only', () => ({}))
import { csvField } from './route'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('allows normal text without quotes', () => {
    expect(csvField('hello')).toBe('hello')
  })

  it('quotes text containing quotes, commas, or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('he said "hi"')).toBe('"he said ""hi"""')
  })

  it('prepends single quote to formula triggers', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('=cmd')).toBe("'=cmd")
    expect(csvField('+cmd')).toBe("'+cmd")
    expect(csvField('-cmd')).toBe("'-cmd")
    expect(csvField('@cmd')).toBe("'@cmd")
    expect(csvField('\tcmd')).toBe("'\tcmd")
    expect(csvField('\rcmd')).toBe('"\'\rcmd"')
    expect(csvField('\ncmd')).toBe('"\'\ncmd"')
    expect(csvField(' ＝cmd')).toBe("' ＝cmd")
  })

  it('does not prepend single quote to genuine numbers', () => {
    expect(csvField(-123)).toBe('-123')
    expect(csvField(123)).toBe('123')
  })
})
