import { describe, it, expect } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it('returns empty string for null or undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes CSV injection characters by prepending a single quote', () => {
    expect(csvField('=cmd|c!test')).toBe("'=cmd|c!test")
    expect(csvField('+123')).toBe("'+123")
    expect(csvField('-123')).toBe("'-123")
    expect(csvField('@test')).toBe("'@test")
    expect(csvField('\ttest')).toBe("'\ttest")
    expect(csvField('\rtest')).toBe('"\'\rtest"') // Due to regex `/[",\r\n]/.test(text)` it gets wrapped in double quotes after escaping
  })

  it('quotes text containing quotes or newlines', () => {
    expect(csvField('a"b')).toBe('"a""b"')
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('a\nb')).toBe('"a\nb"')
  })

  it('returns normal text unchanged', () => {
    expect(csvField('normal text')).toBe('normal text')
    expect(csvField(123)).toBe('123')
  })
})
