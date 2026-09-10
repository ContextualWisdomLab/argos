import { describe, it, expect } from 'vitest'
import { csvField } from './csv-helper'

describe('csvField', () => {
  it('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('handles numbers without modification', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(0)).toBe('0')
  })

  it('prevents CSV injection by prepending quote', () => {
    expect(csvField('=cmd|')).toBe("'=cmd|")
    expect(csvField('+cmd|')).toBe("'+cmd|")
    expect(csvField('-cmd|')).toBe("'-cmd|")
    expect(csvField('@cmd|')).toBe("'@cmd|")
    expect(csvField('\tcmd|')).toBe("'\tcmd|")
  })

  it('handles combination of injection and characters that need escaping', () => {
    expect(csvField('\rcmd|')).toBe("\"'\rcmd|\"")
    expect(csvField('\ncmd|')).toBe("\"'\ncmd|\"")
    expect(csvField('=-"malicious"')).toBe("\"'=-\"\"malicious\"\"\"")
  })

  it('prevents CSV injection with full-width characters', () => {
    expect(csvField('\uff1dcmd|')).toBe("'\uff1dcmd|") // =
    expect(csvField('\uff0bcmd|')).toBe("'\uff0bcmd|") // +
    expect(csvField('\uff0dcmd|')).toBe("'\uff0dcmd|") // -
    expect(csvField('\uff20cmd|')).toBe("'\uff20cmd|") // @
  })

  it('prevents CSV injection with leading spaces', () => {
    expect(csvField(' =cmd|')).toBe("' =cmd|")
    expect(csvField('  +cmd|')).toBe("'  +cmd|")
    expect(csvField('\t -cmd|')).toBe("'\t -cmd|")
  })

  it('escapes quotes and wraps in quotes if needed', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
  })
})
