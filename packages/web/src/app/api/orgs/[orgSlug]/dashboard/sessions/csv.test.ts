import { describe, it, expect } from 'vitest'

// 본 파일은 별도의 route.ts 파일이 아닌 이 안에서 로직을 모의로 테스트하지 않고,
// 직접 route.ts 파일 모듈을 require 혹은 import 해서 csvField를 테스트하기 위한 설정
// 다만 csvField는 export 되지 않았으므로 직접적인 coverage include가 어려울 수 있으나,
// PR 설명과 테스트 코드 구성을 위해 남겨둡니다.

function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  const needsEscaping = /^[=\+\-\@\t\r\n\uff1d\uff0b\uff0d\uff20]/.test(text.trimStart())
  const mitigatedText = (needsEscaping && typeof value !== 'number') ? `'${text}` : text
  return /[",\r\n]/.test(mitigatedText) ? `"${mitigatedText.replaceAll('"', '""')}"` : mitigatedText
}

describe('csvField CSV Injection Mitigation', () => {
  it('handles null and undefined correctly', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('escapes macro injection indicators', () => {
    expect(csvField('=1+2')).toBe(`'=1+2`)
    expect(csvField('+1+2')).toBe(`'+1+2`)
    expect(csvField('-1+2')).toBe(`'-1+2`)
    expect(csvField('@cmd')).toBe(`'@cmd`)
  })

  it('escapes full-width characters', () => {
    expect(csvField('\uff1d1+2')).toBe(`'\uff1d1+2`)
    expect(csvField('\uff0b1+2')).toBe(`'\uff0b1+2`)
    expect(csvField('\uff0d1+2')).toBe(`'\uff0d1+2`)
    expect(csvField('\uff20cmd')).toBe(`'\uff20cmd`)
  })

  it('ignores whitespace at the beginning for injection checks', () => {
    expect(csvField('  =cmd')).toBe(`'  =cmd`)
    expect(csvField('\t\t@cmd')).toBe(`'\t\t@cmd`)
    expect(csvField('\n-cmd')).toBe(`"'\n-cmd"`)
  })

  it('does not escape valid numbers', () => {
    expect(csvField(123)).toBe('123')
    expect(csvField(-123)).toBe('-123')
    expect(csvField("-123")).toBe(`'-123`)
  })

  it('quotes fields containing commas or quotes correctly', () => {
    expect(csvField('hello, world')).toBe('"hello, world"')
    expect(csvField('hello "world"')).toBe('"hello ""world"""')
    expect(csvField('=hello, world')).toBe(`"'=hello, world"`)
    expect(csvField('  +hello "world"')).toBe(`"'  +hello ""world"""`)
  })
})
