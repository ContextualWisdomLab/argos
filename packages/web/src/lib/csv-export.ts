const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@\t\r\n\0＝＋－＠]/

/** Values supported by the CSV export boundary. */
export type CsvFieldValue = string | number | null | undefined

/**
 * Encode one CSV field while neutralizing spreadsheet formula execution.
 *
 * User-controlled string fields that begin with formula-sensitive ASCII,
 * control, or common full-width characters are prefixed with an apostrophe
 * before RFC 4180-style quoting. Numeric values are generated application
 * measurements and remain numeric, including legitimate negative numbers.
 * Embedded quotes are doubled and delimiter/newline-bearing fields are quoted,
 * preventing attacker data from breaking out into a new spreadsheet cell.
 */
export function encodeCsvField(value: CsvFieldValue): string {
  if (value === null || value === undefined) return ''

  let text = String(value)
  if (typeof value === 'string' && SPREADSHEET_FORMULA_PREFIX.test(text)) {
    text = `'${text}`
  }

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
