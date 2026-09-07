import { describe, expect, it } from 'vitest'
import { csvField } from './csv'

describe('csvField', () => {
  it.each([null, undefined])('%s 는 빈 필드로 직렬화한다', (value) => {
    expect(csvField(value)).toBe('')
  })

  it.each([
    [123, '123'],
    [-456, '-456'],
    [0, '0'],
  ] as const)('숫자 %s 의 숫자 표현을 보존한다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    ['=cmd', "'=cmd"],
    ['+cmd', "'+cmd"],
    ['-cmd', "'-cmd"],
    ['@cmd', "'@cmd"],
    ['\tcmd', "'\tcmd"],
    ['\rcmd', '"\'\rcmd"'],
    ['\ncmd', '"\'\ncmd"'],
  ] as const)('수식 시작 문자열 %j 앞에 텍스트 표식을 붙인다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    ['\uff1dcmd', "'\uff1dcmd"],
    ['\uff0bcmd', "'\uff0bcmd"],
    ['\uff0dcmd', "'\uff0dcmd"],
    ['\uff20cmd', "'\uff20cmd"],
  ] as const)('전각 수식 시작 문자 %j 를 텍스트로 직렬화한다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    [' =cmd', "' =cmd"],
    ['  -cmd', "'  -cmd"],
    [' \tcmd', "' \tcmd"],
  ] as const)('선행 공백 뒤 수식 시작 문자열 %j 도 텍스트로 직렬화한다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    ['normal,string', '"normal,string"'],
    ['string with "quotes"', '"string with ""quotes"""'],
    ['multi\nline', '"multi\nline"'],
  ] as const)('구분자나 개행이 있는 %j 를 하나의 CSV 필드로 유지한다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    ['normal', 'normal'],
    [' normal', ' normal'],
    ['123', '123'],
  ] as const)('일반 문자열 %j 를 불필요하게 변형하지 않는다', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })

  it.each([
    ['=cmd,test', '"\'=cmd,test"'],
    ['=-"test"', '"\'=-""test"""'],
  ] as const)('수식 방어와 CSV quote escaping 을 함께 적용한다: %j', (value, expected) => {
    expect(csvField(value)).toBe(expected)
  })
})
