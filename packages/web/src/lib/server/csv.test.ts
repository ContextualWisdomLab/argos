/**
 * csv.test.ts — CSV Formula Injection(CWE-1236) 방어 회귀 테스트
 *
 * dashboard/sessions CSV export 는 사용자 제어 필드(First Prompt =
 * messages[0].content, Title, user.name, project.name)를 그대로 내보낸다.
 * 이 테스트는 수식 트리거 문자로 시작하는 값이 중립화되고, RFC-4180 인용이
 * 유지되며, 정상 값은 변형되지 않음을 고정한다.
 */
import { describe, it, expect } from 'vitest'
import { csvField, neutralizeCsvFormula } from './csv'

describe('neutralizeCsvFormula', () => {
  it('=HYPERLINK 등 = 로 시작하는 수식을 중립화한다', () => {
    expect(neutralizeCsvFormula('=HYPERLINK("http://evil","click")')).toBe(
      '\'=HYPERLINK("http://evil","click")',
    )
  })

  it('+ / - / @ 로 시작하는 값을 중립화한다', () => {
    expect(neutralizeCsvFormula('+1')).toBe("'+1")
    expect(neutralizeCsvFormula('-1')).toBe("'-1")
    expect(neutralizeCsvFormula('@x')).toBe("'@x")
  })

  it('선행 TAB(0x09) / CR(0x0D) 값을 중립화한다', () => {
    expect(neutralizeCsvFormula('\t=1+1')).toBe("'\t=1+1")
    expect(neutralizeCsvFormula('\r=1+1')).toBe("'\r=1+1")
  })

  it('정상 텍스트는 변형하지 않는다', () => {
    expect(neutralizeCsvFormula('hello world')).toBe('hello world')
    expect(neutralizeCsvFormula('user@example.com')).toBe('user@example.com')
    expect(neutralizeCsvFormula('1 + 1 = 2')).toBe('1 + 1 = 2')
    expect(neutralizeCsvFormula('')).toBe('')
  })
})

describe('csvField', () => {
  it('수식 트리거 값을 중립화한 뒤 필요 시 RFC-4180 인용한다', () => {
    // = 로 시작 + 내부에 콤마/따옴표 → 중립화(') 후 전체 인용, 내부 " 는 "" 로.
    expect(csvField('=HYPERLINK("http://evil","click")')).toBe(
      '"\'=HYPERLINK(""http://evil"",""click"")"',
    )
    // + 로 시작하지만 특수문자 없음 → 인용 없이 ' 만 선행.
    expect(csvField('+1')).toBe("'+1")
    expect(csvField('-1')).toBe("'-1")
    expect(csvField('@SUM(A1:A9)')).toBe("'@SUM(A1:A9)")
  })

  it('선행 TAB/CR 은 중립화하고, CR 은 RFC-4180 인용 대상이므로 감싼다', () => {
    expect(csvField('\t=1+1')).toBe("'\t=1+1")
    // 값에 CR 이 포함되면 /[",\r\n]/ 매칭으로 인용됨.
    expect(csvField('\r=1+1')).toBe('"\'\r=1+1"')
  })

  it('null / undefined 는 빈 문자열이다', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })

  it('정상 문자열/숫자는 원본을 유지한다', () => {
    expect(csvField('Fix login bug')).toBe('Fix login bug')
    expect(csvField('user@example.com')).toBe('user@example.com')
    expect(csvField(42)).toBe('42')
    // 음수는 수식 트리거이므로 중립화된다(스프레드시트 안전 우선).
    expect(csvField(-5)).toBe("'-5")
  })

  it('콤마/따옴표/개행이 있는 정상 값은 RFC-4180 인용만 적용한다', () => {
    expect(csvField('Doe, John')).toBe('"Doe, John"')
    expect(csvField('she said "hi"')).toBe('"she said ""hi"""')
    expect(csvField('line1\nline2')).toBe('"line1\nline2"')
  })
})
