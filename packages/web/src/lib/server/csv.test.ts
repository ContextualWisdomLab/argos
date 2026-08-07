import { describe, it, expect } from 'vitest'

describe('CSV Field Sanitization', () => {
  function csvField(value: string | number | null | undefined) {
    if (value === null || value === undefined) return ''
    let text = String(value)
    // CSV Formula Injection prevention
    if (/^[=+\-@\t\r]/.test(text)) {
      text = "'" + text
    }
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }

  it('handles safe values', () => {
    expect(csvField('Hello')).toBe('Hello')
    expect(csvField(123)).toBe('123')
    expect(csvField(null)).toBe('')
  })

  it('adds single quote to dangerous leading characters', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1+1')).toBe("'-1+1")
    expect(csvField('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)")
    expect(csvField('\tHack')).toBe("'\tHack")
    expect(csvField('\rHack')).toBe(`"'\rHack"`)
  })

  it('handles quotes and dangerous leading characters', () => {
    expect(csvField('="Hack"')).toBe(`"'=""Hack"""`)
  })
})
