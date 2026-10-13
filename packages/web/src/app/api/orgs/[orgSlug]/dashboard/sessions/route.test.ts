import { describe, test, expect, vi } from 'vitest'
import { csvField } from './route'

vi.mock('server-only', () => ({}))

describe('csvField', () => {
  test('handles null and undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  test('does not add prefix to numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(0)).toBe('0')
    expect(csvField(-456)).toBe('-456')
  })

  test('adds single quote prefix to prevent Formula Injection', () => {
    expect(csvField('=cmd|C')).toBe("'=cmd|C")
    expect(csvField('+1+2')).toBe("'+1+2")
    expect(csvField('-3-4')).toBe("'-3-4")
    expect(csvField('@sum()')).toBe("'@sum()")
    expect(csvField('\tdata')).toBe("'\tdata")

    // 탭, 엔터로 시작하면 따옴표(quote)에 의해 감싸짐 + prefix '
    expect(csvField('\rdata')).toBe("\"'\rdata\"")
    expect(csvField('\ndata')).toBe("\"'\ndata\"")

    // Full-width characters
    expect(csvField('＝test')).toBe("'＝test")
    expect(csvField('＋test')).toBe("'＋test")
    expect(csvField('－test')).toBe("'－test")
    expect(csvField('＠test')).toBe("'＠test")
  })

  test('escapes quotes correctly', () => {
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
  })

  test('escapes newlines correctly', () => {
    expect(csvField('hello\nworld')).toBe("\"hello\nworld\"")
  })
})
