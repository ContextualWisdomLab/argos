/**
 * csv.ts — CSV 필드 인코딩 유틸리티
 *
 * 스프레드시트(Excel / Google Sheets / LibreOffice)는 셀 값이
 * `=`, `+`, `-`, `@`, TAB(0x09), CR(0x0D) 로 시작하면 이를 "수식(formula)"으로
 * 해석해 실행한다. 사용자 입력값이 그대로 CSV 로 내보내지면
 * `=HYPERLINK(...)`, `=cmd|...`, DDE 페이로드 등이 CSV 를 여는 순간 실행되어
 * 데이터 유출·명령 실행으로 이어질 수 있다. (CWE-1236: CSV/Formula Injection)
 *
 * 아래 두 헬퍼는 그 위협을 차단한다:
 *  - neutralizeCsvFormula(): 수식 트리거 문자로 시작하는 값 앞에 작은따옴표(')를
 *    붙여 텍스트로 강제 해석시킨다. (OWASP CSV Injection 권고)
 *  - csvField(): 수식 중립화 → RFC-4180 인용을 순서대로 적용하는 최종 인코더.
 */

// 스프레드시트가 수식으로 해석하기 시작하는 선행 문자 집합.
//  =, +, -, @  : 산술/수식/DDE 트리거
//  \t (0x09)   : 일부 파서에서 선행 공백 제거 후 다음 문자를 수식으로 해석
//  \r (0x0D)   : 셀 값 선두 CR 도 동일하게 악용 가능
const FORMULA_TRIGGER_PREFIXES = ['=', '+', '-', '@', '\t', '\r']

/**
 * 값이 수식 트리거 문자로 시작하면 작은따옴표(')를 선행시켜 중립화한다.
 * 스프레드시트는 선행 `'` 를 "이 셀은 텍스트" 지시자로 해석하며, 화면에는
 * 따옴표를 표시하지 않으므로 표시상 손실이 거의 없다.
 *
 * RFC-4180 인용보다 먼저 적용되어야 한다. (인용 후에는 첫 문자가 `"` 가 되어
 * 트리거 판별이 어긋나기 때문)
 */
export function neutralizeCsvFormula(text: string): string {
  if (text.length > 0 && FORMULA_TRIGGER_PREFIXES.includes(text[0])) {
    return `'${text}`
  }
  return text
}

/**
 * CSV 한 필드를 안전하게 인코딩한다.
 *  1) 수식 중립화 (neutralizeCsvFormula)
 *  2) RFC-4180 인용: 값에 `"`, `,`, CR, LF 가 있으면 전체를 `"` 로 감싸고
 *     내부 `"` 는 `""` 로 이스케이프한다.
 *
 * 숫자·null·undefined 등 비사용자 입력도 동일 경로를 타지만, 트리거 문자로
 * 시작하지 않는 정상 값은 원본 그대로 유지된다.
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = neutralizeCsvFormula(String(value))
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
