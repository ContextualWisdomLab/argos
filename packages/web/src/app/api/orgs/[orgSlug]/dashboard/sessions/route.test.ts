import { describe, it, expect } from 'vitest'

// We extract csvField for testing to verify its behavior
function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)

  // 🛡️ Sentinel: Prevent CSV Injection (Formula Injection) by prefixing potentially dangerous leading characters
  // OWASP guidance: No universal sanitizer is reliable, but this mitigates standard Excel CSV formula injection
  // at the cost of mutating data (adding a single quote). Includes JA/full-width variants.
  if (/^[\s\x00-\x1F]*[=+\-@\t\r＝＋－＠]/.test(text)) {
    text = "'" + text
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

describe('csvField', () => {
  it('handles benign values normally', () => {
    expect(csvField('Hello World')).toBe('Hello World')
    expect(csvField(123)).toBe('123')
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
    expect(csvField('  Spaces  ')).toBe('  Spaces  ')
  })

  it('escapes quotes and wraps in quotes when containing commas or newlines (RFC 4180)', () => {
    expect(csvField('Hello, World')).toBe('"Hello, World"')
    expect(csvField('Line 1\nLine 2')).toBe('"Line 1\nLine 2"')
    expect(csvField('Quote "test"')).toBe('"Quote ""test"""')
  })

  it('sanitizes Excel formula injection triggers', () => {
    expect(csvField('=CMD|')).toBe("'=CMD|")
    expect(csvField('+1+1')).toBe("'+1+1")
    expect(csvField('-1')).toBe("'-1")
    expect(csvField('@SUM')).toBe("'@SUM")
    expect(csvField('\tData')).toBe("'\tData")
    expect(csvField('\rData')).toBe('"\'\rData"')
  })

  it('sanitizes triggers with leading spaces or control characters', () => {
    expect(csvField('  =CMD')).toBe("'  =CMD")
    expect(csvField('\x0B+1')).toBe("'\x0B+1") // Vertical tab
    expect(csvField('\x1B-1')).toBe("'\x1B-1") // Escape
  })

  it('sanitizes full-width (JA) formula injection triggers', () => {
    expect(csvField('＝CMD')).toBe("'＝CMD")
    expect(csvField('＋1')).toBe("'＋1")
    expect(csvField('－1')).toBe("'－1")
    expect(csvField('＠SUM')).toBe("'＠SUM")
  })
})
