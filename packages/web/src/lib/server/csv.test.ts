import { describe, expect, it } from 'vitest'
import { sanitizeCsvField } from './csv'

describe('sanitizeCsvField 보안 경계', () => {
  it.each([
    ['=cmd|C\\calc!A0', "'=cmd|C\\calc!A0"],
    ['+1+2', "'+1+2"],
    ['-SUM(A1:A10)', "'-SUM(A1:A10)"],
    ['@SUM(A1:A10)', "'@SUM(A1:A10)"],
    ['  =1+1', "'  =1+1"],
    ['\t-2', "'\t-2"],
    ['\uFEFF=1+1', "'\uFEFF=1+1"],
  ])('수식 트리거가 있는 값 %j을 데이터로 고정한다', (input, expected) => {
    expect(sanitizeCsvField(input)).toBe(expected)
  })

  it('수식 트리거와 큰따옴표가 함께 있어도 CSV 이스케이프를 보존한다', () => {
    expect(sanitizeCsvField('="malicious"')).toBe(`"'=""malicious"""`)
  })

  it.each([
    [null, ''],
    [undefined, ''],
  ])('값이 %s이면 빈 CSV 필드를 반환한다', (input, expected) => {
    expect(sanitizeCsvField(input)).toBe(expected)
  })

  it.each([
    ['Normal text', 'Normal text'],
    ['123', '123'],
  ])('일반 값 %j을 변경하지 않는다', (input, expected) => {
    expect(sanitizeCsvField(input)).toBe(expected)
  })

  it.each([
    ['Text "with" quotes', `"Text ""with"" quotes"`],
    ['Text, with comma', `"Text, with comma"`],
    ['Text\nwith newline', `"Text\nwith newline"`],
  ])('CSV 구문 문자가 있는 값 %j을 RFC 4180 형태로 인용한다', (input, expected) => {
    expect(sanitizeCsvField(input)).toBe(expected)
  })
})
