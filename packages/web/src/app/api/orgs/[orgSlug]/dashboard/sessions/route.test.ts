import { describe, it, expect } from 'vitest'

// We extract csvField logic specifically to test it
function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''

  // Prevent CSV Injection (Macro Injection)
  if (typeof value !== 'number') {
    const textValue = String(value);
    if (/^[ \t\r\n]*[=+\-@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/i.test(textValue)) {
      value = "'" + textValue;
    }
  }

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

describe('csvField', () => {
  it('prevents CSV injection by prepending a single quote', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@1+1')).toBe("'@1+1")
    expect(csvField('\t1+1')).toBe("'\t1+1")
    expect(csvField('\uff1d1+1')).toBe("'\uff1d1+1") // Full-width equals
  })

  it('handles regular values correctly', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
  })

  it('escapes quotes correctly', () => {
    expect(csvField('he"llo')).toBe('"he""llo"')
  })
})
