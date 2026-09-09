import { describe, it, expect } from 'vitest'
import { csvField } from './csv-field'

describe('csvField', () => {
  it('prevents CSV Formula Injection', () => {
    expect(csvField("=cmd|' /C calc'!A0")).toBe('\'=cmd|\' /C calc\'!A0')
    expect(csvField("-123")).toBe("'-123")
    expect(csvField(" \t =something")).toBe("' \t =something")
    expect(csvField(-123)).toBe("-123")
    expect(csvField(null)).toBe("")
    expect(csvField(undefined)).toBe("")
  })

  it('escapes standard CSV fields correctly', () => {
    expect(csvField('Hello, World')).toBe('"Hello, World"')
    expect(csvField('Line1\nLine2')).toBe('"Line1\nLine2"')
    expect(csvField('Line1\r\nLine2')).toBe('"Line1\r\nLine2"')
    expect(csvField('She said "Hello"')).toBe('"She said ""Hello"""')
    expect(csvField('=Danger, "Zone"')).toBe('\"\'=Danger, ""Zone""\"')
  })
})
