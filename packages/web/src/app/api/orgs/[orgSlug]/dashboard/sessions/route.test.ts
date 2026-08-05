import { describe, it, expect } from 'vitest'

// We recreate the function logic exactly as it is in route.ts to test it here.
// Recreating it avoids Next.js Server Component export restrictions when trying to import from route.ts.
function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  let text = String(value)
  // Prevent CSV Injection (Formula Injection) only for strings to avoid breaking negative numbers
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) {
    text = "'" + text
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns normal text as is', () => {
    expect(csvField('normal text')).toBe('normal text')
  })

  it('handles positive and negative numbers correctly (without escaping)', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField(+456)).toBe('456') // numbers are just strings without '+' when toString() is called
  })

  it('escapes quotes and wraps in quotes if text contains quotes', () => {
    expect(csvField('he said "hello"')).toBe('"he said ""hello"""')
  })

  it('wraps in quotes if text contains commas or newlines', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello\r\nworld')).toBe('"hello\r\nworld"')
  })

  it('prepends a single quote to prevent CSV injection for strings starting with =, +, -, @', () => {
    expect(csvField('=1+2')).toBe("'=1+2")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1+2')).toBe("'-1+2")
    expect(csvField('@1+2')).toBe("'@1+2")
  })
})
