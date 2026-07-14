import { describe, expect, it, vi } from 'vitest'

// Mock server-only and next headers to avoid import errors in this unit test
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: vi.fn(),
}))

import { csvField } from './route'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('returns numbers without quotes (no side-effects for numbers)', () => {
    expect(csvField(123)).toBe(123)
    expect(csvField(-15)).toBe(-15)
    expect(csvField(0)).toBe(0)
    expect(csvField(1.23)).toBe(1.23)
  })

  it('handles regular text safely', () => {
    expect(csvField('hello')).toBe('hello')
    expect(csvField('world')).toBe('world')
  })

  it('wraps text with quotes if it contains commas or quotes or newlines', () => {
    expect(csvField('hello,world')).toBe('"hello,world"')
    expect(csvField('hello\nworld')).toBe('"hello\nworld"')
    expect(csvField('hello"world')).toBe('"hello""world"')
  })

  it('prevents CSV Injection by prepending single quotes to dangerous starting characters', () => {
    expect(csvField('=cmd|')).toBe("'=" + 'cmd|')
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-1-2')).toBe("'-1-2")
    expect(csvField('@SUM')).toBe("'@SUM")
    // \t is not in the wrapping regex /[",\r\n]/, so it shouldn't get double quotes
    expect(csvField('\tvalue')).toBe("'\tvalue")
    // \r is in the wrapping regex /[",\r\n]/, so it gets wrapped in double quotes
    expect(csvField('\rvalue')).toBe("\"'\rvalue\"")
  })
})
